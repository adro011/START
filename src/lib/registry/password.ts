import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Registry password hashing (scrypt, from Node's stdlib — no new dependency).
 *
 * Stored format: scrypt$<N>$<r>$<p>$<salt-base64>$<key-base64>
 * Parameters are stored alongside the hash so they can be raised later; the
 * verifier honours whatever a row carries.
 */

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem?: number },
) => Promise<Buffer>;

const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Sanity limits so a hand-edited row cannot turn a login into a CPU bomb. */
const MAX_N = 1 << 20;
const MAX_R = 32;
const MAX_P = 16;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scryptAsync(plain, salt, KEY_LENGTH, { ...PARAMS });
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!plain || !stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  if (N < 2 || N > MAX_N || (N & (N - 1)) !== 0) return false;
  if (r < 1 || r > MAX_R || p < 1 || p > MAX_P) return false;

  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    // scrypt needs maxmem > 128 * N * r; give it headroom for the stored params.
    const key = await scryptAsync(plain, salt, expected.length, {
      N,
      r,
      p,
      maxmem: 128 * N * r + 1024 * 1024,
    });
    if (key.length !== expected.length) return false;
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}
