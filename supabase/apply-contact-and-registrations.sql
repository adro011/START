-- One-shot, idempotent fix for the two tables the live site actually needs:
--   public.registrations     -> footer "Join us" form (currently returns 500)
--   public.contact_messages  -> /api/contact (backend storage)
-- Safe to run multiple times. Defines touch_updated_at() itself so it does
-- NOT depend on 0014 having been applied.

-- ── shared trigger function ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── registrations (footer signup) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'footer',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registrations_email_key UNIQUE (email),
  CONSTRAINT registrations_email_format CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

DROP TRIGGER IF EXISTS trg_registrations_updated ON public.registrations;
CREATE TRIGGER trg_registrations_updated
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations admin all" ON public.registrations;
CREATE POLICY "registrations admin all" ON public.registrations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value)
VALUES ('registration_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── contact_messages (contact form) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  source text NOT NULL DEFAULT 'contact',
  user_agent text,
  ip_hash text,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_messages_name_length CHECK (char_length(name) BETWEEN 2 AND 80),
  CONSTRAINT contact_messages_email_format CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT contact_messages_message_length CHECK (char_length(message) BETWEEN 10 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON public.contact_messages (status, created_at DESC);

DROP TRIGGER IF EXISTS trg_contact_messages_updated ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact messages admin all" ON public.contact_messages;
CREATE POLICY "contact messages admin all" ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
