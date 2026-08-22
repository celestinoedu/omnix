import { createClient } from "npm:@supabase/supabase-js@2.57.4";

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

function secretKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) return JSON.parse(modern).default as string;
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

export function adminClient() {
  return createClient(env("SUPABASE_URL"), secretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(req: Request) {
  const authorization = req.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sessão ausente.");

  const client = adminClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("Sessão inválida ou expirada.");
  return data.user;
}

export function requiredEnv(name: string) {
  return env(name);
}

