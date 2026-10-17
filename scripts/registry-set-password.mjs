#!/usr/bin/env node
/**
 * Set (or reset) a shop-registry password.
 *
 *   node scripts/registry-set-password.mjs <email> <new-password> [--role admin|staff] [--name "Full Name"]
 *
 * Reads Supabase credentials from the environment (nothing is written to disk):
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Parameters must stay in sync with src/lib/registry/password.ts
 * (scrypt$N$r$p$salt-b64$key-b64, N=16384 r=8 p=1, 16-byte salt, 64-byte key).
 */

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--role" || arg === "--name") {
      flags[arg.slice(2)] = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function usage(message) {
  if (message) console.error(`error: ${message}\n`);
  console.error(
    'usage: node scripts/registry-set-password.mjs <email> <new-password> [--role admin|staff] [--name "Full Name"]',
  );
  process.exit(1);
}

async function hashPassword(plain) {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scryptAsync(plain, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const [email, password] = positional;

if (!email || !password) usage("email and new password are required");
if (!email.includes("@")) usage(`"${email}" does not look like an email address`);
if (password.length < 8) usage("choose a password of at least 8 characters");

const role = flags.role ?? "staff";
if (role !== "admin" && role !== "staff") usage('--role must be "admin" or "staff"');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "error: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment first.",
  );
  process.exit(1);
}

const fullName = flags.name ?? email.split("@")[0];
const password_hash = await hashPassword(password);

const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/registry_users?on_conflict=email`;
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify([
    {
      email,
      full_name: fullName,
      role,
      password_hash,
      deleted_at: null,
    },
  ]),
});

if (!response.ok) {
  console.error(`error: Supabase responded ${response.status} ${response.statusText}`);
  console.error(await response.text());
  process.exit(1);
}

console.log(`ok: ${email} can now sign in at /registry/login (role: ${role}).`);
