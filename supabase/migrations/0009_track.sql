-- brand-store 0009: guest order tracking RPC.
-- SECURITY DEFINER (runs as the function owner, bypassing the orders RLS
-- policies which only allow the owning authenticated user or staff/admin to
-- read). Access requires BOTH the order number AND the guest phone used at
-- checkout; only non-sensitive tracking fields are returned.

CREATE OR REPLACE FUNCTION public.track_order(
  p_order_no text,
  p_phone text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_no text;
  v_status text;
  v_courier text;
  v_tracking_no text;
  v_created_at timestamptz;
BEGIN
  SELECT o.order_no, o.status, o.courier, o.tracking_no, o.created_at
    INTO v_order_no, v_status, v_courier, v_tracking_no, v_created_at
    FROM public.orders o
   WHERE upper(o.order_no) = upper(btrim(coalesce(p_order_no, '')))
     AND o.guest_phone = btrim(coalesce(p_phone, ''));
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'order_no', v_order_no,
    'status', v_status,
    'courier', v_courier,
    'tracking_no', v_tracking_no,
    'created_at', v_created_at
  );
END;
$$;

-- Functions default to EXECUTE for PUBLIC; grant explicitly to the roles the
-- storefront uses (anon = guest tracking, authenticated = logged-in users).
REVOKE ALL ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;
