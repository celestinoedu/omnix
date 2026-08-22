import { corsHeaders, json, safeError } from "../_shared/http.ts";
import { sha256 } from "../_shared/crypto.ts";
import { adminClient, requireOmniXUser, requiredEnv } from "../_shared/supabase.ts";
import { decryptToken } from "../_shared/crypto.ts";
import { exchangeCode, saveTikTokCredentials } from "../_shared/tiktok.ts";

function callbackUri() {
  return `${requiredEnv("SUPABASE_URL")}/functions/v1/tiktok-auth/callback`;
}

function appUrl(result?: string) {
  const url = new URL(requiredEnv("OMNIX_APP_URL"));
  if (result) url.searchParams.set("tiktok", result);
  return url.toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  try {
    if (req.method === "GET" && url.pathname.endsWith("/callback")) {
      const state = url.searchParams.get("state");
      const code = url.searchParams.get("code");
      if (!state || !code || url.searchParams.get("error")) return Response.redirect(appUrl("denied"), 302);

      const client = adminClient();
      const digest = await sha256(state);
      const { data: oauthState } = await client.from("omnix_oauth_states")
        .select("id,user_id")
        .eq("provider", "TikTok")
        .eq("state_digest", digest)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (!oauthState) return Response.redirect(appUrl("invalid_state"), 302);

      const { data: consumed } = await client.from("omnix_oauth_states")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", oauthState.id)
        .is("consumed_at", null)
        .select("id")
        .single();
      if (!consumed) return Response.redirect(appUrl("invalid_state"), 302);

      const { data: membership } = await client.from("omnix_profiles")
        .select("id").eq("user_id", oauthState.user_id).maybeSingle();
      if (!membership) return Response.redirect(appUrl("error"), 302);

      const token = await exchangeCode(code, callbackUri());
      if (!token.scope.split(",").includes("video.publish")) return Response.redirect(appUrl("missing_scope"), 302);
      await saveTikTokCredentials(client, oauthState.user_id, token);
      return Response.redirect(appUrl("connected"), 302);
    }

    if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
    const user = await requireOmniXUser(req);
    const body = await req.json().catch(() => ({}));
    const client = adminClient();

    if (body.action === "disconnect") {
      const { data: account } = await client.from("omnix_social_accounts")
        .select("id,omnix_social_credentials(encrypted_access_token)")
        .eq("user_id", user.id).eq("platform", "TikTok").eq("status", "active").limit(1).maybeSingle();
      const credentials = Array.isArray(account?.omnix_social_credentials) ? account?.omnix_social_credentials[0] : account?.omnix_social_credentials;
      if (credentials?.encrypted_access_token) {
        const token = await decryptToken(credentials.encrypted_access_token);
        await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_key: requiredEnv("TIKTOK_CLIENT_KEY"), client_secret: requiredEnv("TIKTOK_CLIENT_SECRET"), token }),
        });
      }
      if (account) {
        await client.from("omnix_social_credentials").delete().eq("social_account_id", account.id);
        await client.from("omnix_social_accounts").update({ status: "revoked", updated_at: new Date().toISOString() }).eq("id", account.id);
      }
      return json({ ok: true });
    }

    const stateBytes = crypto.getRandomValues(new Uint8Array(32));
    const state = btoa(String.fromCharCode(...stateBytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
    const { error } = await client.from("omnix_oauth_states").insert({
      user_id: user.id,
      provider: "TikTok",
      state_digest: await sha256(state),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (error) throw error;

    const authorize = new URL("https://www.tiktok.com/v2/auth/authorize/");
    authorize.searchParams.set("client_key", requiredEnv("TIKTOK_CLIENT_KEY"));
    authorize.searchParams.set("response_type", "code");
    authorize.searchParams.set("scope", "user.info.basic,video.publish");
    authorize.searchParams.set("redirect_uri", callbackUri());
    authorize.searchParams.set("state", state);
    return json({ authorizationUrl: authorize.toString() });
  } catch (error) {
    console.error("tiktok-auth", safeError(error));
    if (req.method === "GET") return Response.redirect(appUrl("error"), 302);
    return json({ error: safeError(error) }, 400);
  }
});
