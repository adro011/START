-- brand-store 0015: footer "Join us" registrations + admin-controlled signup switch

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

-- No public policies: signups go through the API using the service role,
-- and only admins may read/manage the list.
DROP POLICY IF EXISTS "registrations admin all" ON public.registrations;
CREATE POLICY "registrations admin all" ON public.registrations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin switch that drives whether the footer form is open.
INSERT INTO public.site_settings (key, value)
VALUES ('registration_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
