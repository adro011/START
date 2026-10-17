/**
 * Signed registry session tokens.
 *
 * Isomorphic on purpose: the same token is issued by the login server action
 * (Node) and verified both by lib/auth.ts (Node) and by the Edge middleware
 * (Web Crypto). So this file must stay free of node: imports and of
 * "server-only".
 *
 * Token:  v1.<base64url(payload)>.<base64url(HMAC-SHA256("v1.<payload>"))>
 * Payload: { sub, email, role, exp } — exp is a unix timestamp in seconds.
 *
 * Fail closed: without REGISTRY_SESSION_SECRET nothing verifies and nothing is
 * issued. This replaces the old unsigned `demo_session` JSON cookie, which
 * production correctly refused to trust.
 */

export const REGISTRY_SESSION_COOKIE = "registry_session";
export const REGISTRY_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const REGISTRY_SESSION_VERSION = "v1";

export type RegistryRole = "admin" | "staff";

export interface RegistrySessionPayload {
  sub: string;
  email: string;
  role: RegistryRole;
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function secret(): string | null {
  const value = process.env.REGISTRY_SESSION_SECRET;
  return value && value.length > 0 ? value : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey | null> {
  const value = secret();
  if (!value) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(value),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Issue a signed session token, or null when no secret is configured. */
export async function signRegistrySession(
  input: Omit<RegistrySessionPayload, "exp">,
  ttlSeconds: number = REGISTRY_SESSION_TTL_SECONDS,
): Promise<string | null> {
  const key = await hmacKey();
  if (!key) return null;
  const payload: RegistrySessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = `${REGISTRY_SESSION_VERSION}.${toBase64Url(encoder.encode(JSON.stringify(payload)))}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Verify a signed session token. Returns null for anything tampered, expired or unknown. */
export async function verifyRegistrySession(
  token: string | null | undefined,
): Promise<RegistrySessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== REGISTRY_SESSION_VERSION) return null;
  const key = await hmacKey();
  if (!key) return null;
  try {
    const signatureOk = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!signatureOk) return null;
    const payload = JSON.parse(decoder.decode(fromBase64Url(parts[1]))) as RegistrySessionPayload;
    if (!payload?.sub || typeof payload.sub !== "string") return null;
    if (!payload.email || typeof payload.email !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "staff") return null;
    if (typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Cookie attributes for the signed session (httpOnly — never readable by JS). */
export function registrySessionCookieOptions(maxAge: number = REGISTRY_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
