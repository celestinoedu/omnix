import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.4";
import { decryptToken, encryptToken } from "./crypto.ts";
import { requiredEnv } from "./supabase.ts";

type TikTokTokenResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
};

export type CreatorInfo = {
  creator_avatar_url: string;
  creator_username: string;
  creator_nickname: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec: number;
};

function tokenExpiry(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

async function tokenRequest(body: URLSearchParams) {
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body,
  });
  const data = await response.json() as TikTokTokenResponse;
  if (!response.ok || data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || "O TikTok recusou a autenticação.");
  }
  return data;
}

export async function exchangeCode(code: string, redirectUri: string) {
  return tokenRequest(new URLSearchParams({
    client_key: requiredEnv("TIKTOK_CLIENT_KEY"),
    client_secret: requiredEnv("TIKTOK_CLIENT_SECRET"),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  }));
}

export async function getUserInfo(accessToken: string) {
  const response = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await response.json();
  if (!response.ok || result.error?.code !== "ok") throw new Error(result.error?.message || "Não foi possível ler o perfil TikTok.");
  return result.data.user as { open_id: string; display_name: string; avatar_url?: string };
}

export async function getActiveTikTokToken(client: SupabaseClient, accountId: string) {
  const { data: account, error: accountError } = await client
    .from("social_accounts")
    .select("id,token_expires_at,status")
    .eq("id", accountId)
    .eq("platform", "TikTok")
    .single();
  if (accountError || !account || account.status !== "active") throw new Error("A conta TikTok precisa ser reconectada.");

  const { data: credentials, error: credentialsError } = await client
    .from("social_credentials")
    .select("encrypted_access_token,encrypted_refresh_token")
    .eq("social_account_id", accountId)
    .single();
  if (credentialsError || !credentials) throw new Error("Credenciais TikTok não encontradas.");

  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 5 * 60 * 1000) return decryptToken(credentials.encrypted_access_token);
  if (!credentials.encrypted_refresh_token) throw new Error("A autorização TikTok expirou. Reconecte a conta.");

  const currentRefreshToken = await decryptToken(credentials.encrypted_refresh_token);
  const refreshed = await tokenRequest(new URLSearchParams({
    client_key: requiredEnv("TIKTOK_CLIENT_KEY"),
    client_secret: requiredEnv("TIKTOK_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
  }));

  await client.from("social_credentials").update({
    encrypted_access_token: await encryptToken(refreshed.access_token),
    encrypted_refresh_token: await encryptToken(refreshed.refresh_token),
    updated_at: new Date().toISOString(),
  }).eq("social_account_id", accountId);
  await client.from("social_accounts").update({
    token_expires_at: tokenExpiry(refreshed.expires_in),
    refresh_token_expires_at: tokenExpiry(refreshed.refresh_expires_in),
    scopes: refreshed.scope.split(",").filter(Boolean),
    status: "active",
    updated_at: new Date().toISOString(),
  }).eq("id", accountId);

  return refreshed.access_token;
}

export async function queryCreatorInfo(accessToken: string) {
  const response = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
  });
  const result = await response.json();
  if (!response.ok || result.error?.code !== "ok") throw new Error(result.error?.message || result.error?.code || "Não foi possível consultar a conta TikTok.");
  return result.data as CreatorInfo;
}

export async function saveTikTokCredentials(client: SupabaseClient, userId: string, token: TikTokTokenResponse) {
  const profile = await getUserInfo(token.access_token);
  const { data: account, error } = await client.from("social_accounts").upsert({
    user_id: userId,
    platform: "TikTok",
    platform_account_id: token.open_id,
    display_name: profile.display_name || "Conta TikTok",
    scopes: token.scope.split(",").filter(Boolean),
    status: "active",
    token_expires_at: tokenExpiry(token.expires_in),
    refresh_token_expires_at: tokenExpiry(token.refresh_expires_in),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,platform,platform_account_id" }).select("id").single();
  if (error || !account) throw new Error("Não foi possível registrar a conta TikTok.");

  const { error: credentialError } = await client.from("social_credentials").upsert({
    social_account_id: account.id,
    encrypted_access_token: await encryptToken(token.access_token),
    encrypted_refresh_token: await encryptToken(token.refresh_token),
    encryption_key_version: 1,
    updated_at: new Date().toISOString(),
  });
  if (credentialError) throw new Error("Não foi possível proteger as credenciais TikTok.");
  return account.id as string;
}

