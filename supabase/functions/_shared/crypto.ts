import { requiredEnv } from "./supabase.ts";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function key() {
  const raw = base64ToBytes(requiredEnv("SOCIAL_TOKEN_ENCRYPTION_KEY"));
  if (raw.byteLength !== 32) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY deve ter 32 bytes em base64.");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptToken(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), new TextEncoder().encode(value)));
  const payload = new Uint8Array(iv.length + encrypted.length);
  payload.set(iv);
  payload.set(encrypted, iv.length);
  return bytesToBase64(payload);
}

export async function decryptToken(value: string) {
  const payload = base64ToBytes(value);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: payload.slice(0, 12) }, await key(), payload.slice(12));
  return new TextDecoder().decode(decrypted);
}

export async function sha256(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return bytesToBase64(digest).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

