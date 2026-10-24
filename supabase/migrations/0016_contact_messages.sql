-- brand-store 0016: contact form submissions (persisted by /api/contact)

-- Self-contained: 0015 depends on this helper, so keep it available even when
-- 0014 has not been applied yet on an older database.
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

-- Submissions are written by the API with the service role (bypasses RLS);
-- only admins may read or manage them.
DROP POLICY IF EXISTS "contact messages admin all" ON public.contact_messages;
CREATE POLICY "contact messages admin all" ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
