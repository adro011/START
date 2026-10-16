-- Fix: fresh Supabase projects pre-install pgcrypto in the `extensions`
-- schema, so `CREATE EXTENSION IF NOT EXISTS ... WITH SCHEMA public`
-- in 0001 was a no-op and `public.gen_random_uuid()` (called by
-- SECURITY DEFINER RPCs running with an empty search_path) did not exist.
-- Relocate both extensions into `public` where migrations expect them.
-- Table DEFAULTs reference functions by OID and keep working after the move.

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA public;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'pgcrypto' AND n.nspname <> 'public'
  ) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA public;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'pg_trgm' AND n.nspname <> 'public'
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA public;
  END IF;
END
$$;
