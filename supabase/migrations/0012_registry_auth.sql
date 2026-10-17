-- brand-store 0012: real registry staff auth.
--
-- The registry login previously authenticated against hardcoded demo
-- credentials and set an UNSIGNED JSON cookie, which production deliberately
-- ignores (see demoLoginAllowed() in lib/auth.ts). This adds a real credential
-- store: a scrypt password hash per registry user, plus last_login_at.
--
-- Hash format (see src/lib/registry/password.ts):
--   scrypt$<N>$<r>$<p>$<salt-base64>$<key-base64>
--
-- Seeded owner account uses a temporary password and MUST be rotated with
--   node scripts/registry-set-password.mjs <email> <new-password>
--
-- Idempotent: ADD COLUMN IF NOT EXISTS / ON CONFLICT DO UPDATE.

ALTER TABLE public.registry_users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.registry_users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Seed the owner as an admin so there is always one way in.
INSERT INTO public.registry_users (email, full_name, role, password_hash)
VALUES (
  'ziahoque@1980@gmail.com',
  'Zia Hoque',
  'admin',
  'scrypt$16384$8$1$eT02k30LBUF006v4tAAJvQ==$SKmAwvrGAyZjMBbudtgJW0RNnWR9Oqx466BY3y1yhaBC+UMaL0roREx96VSrNLhL8YYJ1be148h4vSvt2H1HOQ=='
)
ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      password_hash = EXCLUDED.password_hash,
      deleted_at = NULL,
      updated_at = now();
