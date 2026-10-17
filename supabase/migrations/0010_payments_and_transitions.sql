-- brand-store 0010: payments ledger, order-transition guard, trigger event log.
-- Enforces the e-commerce rules at the DB level:
-- - payments(tran_id) unique → webhook idempotency across deploys
-- - illegal status transitions rejected in SQL (not just in server actions)
-- - every status change logged to order_events in the same transaction
-- - cancel_order of a paid order sets payment_status='refunded'

-- payments ---------------------------------------------------------------------
-- One row per gateway idempotency key. IPN handler inserts here first with
-- ON CONFLICT (tran_id) DO NOTHING: affected row = first delivery.
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  tran_id text NOT NULL UNIQUE,
  val_id text,
  gateway text NOT NULL DEFAULT 'sslcommerz'
    CHECK (gateway IN ('sslcommerz')),
  amount_paisa integer NOT NULL CHECK (amount_paisa >= 0),
  currency text NOT NULL DEFAULT 'BDT',
  status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'failed')),
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);

DROP TRIGGER IF EXISTS trg_payments_updated ON public.payments;
CREATE TRIGGER trg_payments_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Staff (and order owners) may see payment rows; writes happen only through
-- the service-role webhook (no INSERT policy → RLS denies everyone else).
DROP POLICY IF EXISTS "payments staff read" ON public.payments;
CREATE POLICY "payments staff read" ON public.payments
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "payments owner read" ON public.payments;
CREATE POLICY "payments owner read" ON public.payments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND o.user_id = auth.uid()
    )
  );

-- Legal state transitions -------------------------------------------------------
-- Enforced by trg_guard_order_transition so nothing can bypass it — RLS update
-- via authenticated staff or service-role writes all pass through the trigger.
CREATE TABLE IF NOT EXISTS public.order_transitions (
  from_status text,
  to_status text,
  PRIMARY KEY (from_status, to_status)
);

INSERT INTO public.order_transitions (from_status, to_status)
SELECT * FROM (VALUES
  ('pending',   'confirmed'), ('pending',   'cancelled'),
  ('confirmed', 'packed'),    ('confirmed', 'cancelled'),
  ('packed',    'shipped'),
  ('shipped',   'delivered'), ('shipped',   'returned'),
  ('delivered', 'returned')
) AS t(from_status, to_status)
ON CONFLICT (from_status, to_status) DO NOTHING;

ALTER TABLE public.order_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transitions staff read" ON public.order_transitions;
CREATE POLICY "transitions staff read" ON public.order_transitions
  FOR SELECT TO authenticated USING (public.is_staff_or_admin());

-- Guard: reject illegal status transitions (status unchanged → pass).
CREATE OR REPLACE FUNCTION public.guard_order_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.order_transitions t
     WHERE t.from_status = OLD.status
       AND t.to_status = NEW.status
  ) THEN
    RAISE EXCEPTION 'Illegal status transition: % -> %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_order_transition ON public.orders;
CREATE TRIGGER trg_guard_order_transition
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_transition();

-- Log every status change to order_events inside the same transaction.
-- Actor: caller uuid when a JWT is present (staff/admin/user), else 'system'
-- (service-role webhook). Note: callers may supply a nicer one via
-- set_config('app.event_note', ..., true) before the order update, as
-- cancel_order does.
CREATE OR REPLACE FUNCTION public.log_order_status_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_events (order_id, status, note, actor)
    VALUES (
      NEW.id,
      NEW.status,
      coalesce(
        NULLIF(current_setting('app.event_note', true), ''),
        'Status changed to ' || NEW.status
      ),
      coalesce(auth.uid()::text, 'system')
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_event ON public.orders;
CREATE TRIGGER trg_log_order_status_event
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_event();

-- cancel_order: restore stock exactly once (status guard), auto-refund paid.
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_o public.orders%ROWTYPE;
  v_actor text := coalesce(auth.uid()::text, 'guest');
BEGIN
  SELECT * INTO v_o FROM public.orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF v_o.user_id IS NULL THEN
    -- Guest order: only staff/admin may cancel (no owner session to check).
    IF NOT public.is_staff_or_admin() THEN
      RAISE EXCEPTION 'Forbidden';
    END IF;
  ELSIF v_o.user_id IS DISTINCT FROM auth.uid() AND NOT public.is_staff_or_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF v_o.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Cannot cancel order in status %', v_o.status;
  END IF;

  UPDATE public.product_variants v
     SET stock = v.stock + i.qty
    FROM public.order_items i
   WHERE i.order_id = p_order AND v.id = i.variant_id;

  PERFORM set_config('app.event_note', 'Order cancelled, stock restored', true);

  IF v_o.payment_status = 'paid' THEN
    UPDATE public.orders
       SET status = 'cancelled', payment_status = 'refunded'
     WHERE id = p_order;
  ELSE
    UPDATE public.orders SET status = 'cancelled' WHERE id = p_order;
  END IF;

  IF v_o.coupon_code IS NOT NULL THEN
    UPDATE public.coupons
       SET used_count = GREATEST(used_count - 1, 0)
      WHERE code = v_o.coupon_code;
  END IF;

  RETURN jsonb_build_object('id', p_order, 'status', 'cancelled');
END;
$$;
