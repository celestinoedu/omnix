import { corsHeaders, json, safeError } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";
import { getActiveTikTokToken, queryCreatorInfo } from "../_shared/tiktok.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const client = adminClient();
    const { data: account } = await client.from("social_accounts")
      .select("id,display_name")
      .eq("user_id", user.id).eq("platform", "TikTok").eq("status", "active").single();
    if (!account) return json({ error: "Conecte uma conta TikTok primeiro." }, 409);
    const accessToken = await getActiveTikTokToken(client, account.id);
    return json({ accountId: account.id, displayName: account.display_name, creator: await queryCreatorInfo(accessToken) });
  } catch (error) {
    console.error("tiktok-creator-info", safeError(error));
    return json({ error: safeError(error) }, 400);
  }
});

