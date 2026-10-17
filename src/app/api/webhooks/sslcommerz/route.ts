import { z } from 'zod';
import { getDemoOrder } from '@/lib/admin-data';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

// SSLCommerz IPN/webhook stub.
// LIVE NOTES (wire before going live):
// 1. After receiving tran_id, server-to-server validate via the SSLCommerz
//    validation API: https://securepay.sslcommerz.com/validator/api/validationserverAPI.php
//    ?val_id=<val_id>&store_id=<STORE_ID>&store_passwd=<PASSWD>&format=json
//    (sandbox: https://sandbox.sslcommerz.com/...). Never trust the callback alone.
// 2. Check `status === 'VALID'` (or 'VALIDATED') AND amount matches the order total
//    AND currency matches — recalculated from DB, never from the client.
// 3. Idempotency: orders/payment callbacks must be unique on tran_id (DB unique
//    constraint + ON CONFLICT DO NOTHING). The in-memory Set below is a fast-path
//    within a single deploy; the DB check against orders provides cross-deploy
//    idempotency once a payments/tran_id column exists (see migration note).

const PayloadSchema = z.object({
  orderNo: z.string().min(1),
  amount: z.coerce.number().positive(),
  status: z.string().min(1),
  tranId: z.string().min(1),
});

// Demo-only idempotency fast-path (resets on deploy). Production: unique index on
// payments(tran_id) + ON CONFLICT DO NOTHING. See comments above.
const seenTranIds = new Set<string>();

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ result: 'FAILED', reason: 'invalid-json' }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ result: 'FAILED', reason: 'invalid-payload' }, { status: 400 });
  }
  const { orderNo, amount, status, tranId } = parsed.data;

  // Fast-path: same tran_id seen in this deploy → duplicate.
  if (seenTranIds.has(tranId)) {
    return Response.json({ result: 'DUPLICATE', orderNo, tranId });
  }

  // Cross-deploy idempotency: if this order is already paid, skip re-processing.
  const admin = createServiceRoleClient();
  if (admin) {
    try {
      const { data: existing, error: e } = await admin
        .from('orders')
        .select('id, payment_status, order_no')
        .eq('order_no', orderNo)
        .eq('payment_status', 'paid')
        .maybeSingle();
      if (!e && existing) {
        seenTranIds.add(tranId);
        return Response.json({ result: 'DUPLICATE', orderNo, tranId, existingOrderNo: existing.order_no });
      }
    } catch {
      // Fall through to normal processing; DB may be unavailable.
    }
  }

  const order = getDemoOrder(orderNo);
  if (!order) {
    return Response.json({ result: 'FAILED', reason: 'order-not-found' }, { status: 404 });
  }

  // Demo: amount is expected in paisa to match totalPaisa.
  // Live: SSLCommerz posts BDT taka (e.g. 5058.00) — convert: Math.round(taka*100).
  const paidPaisa = Math.round(amount);
  const okStatus = status === 'VALID' || status === 'VALIDATED';
  if (!okStatus || paidPaisa !== order.totalPaisa) {
    return Response.json({ result: 'FAILED', orderNo, expected: order.totalPaisa, received: paidPaisa }, { status: 422 });
  }

  seenTranIds.add(tranId);
  // TODO: picks shipping zone, marks payment_status='paid', writes order_event, revalidateTag('orders').
  console.log('sslcommerz webhook VALIDATED (stub) →', { orderNo, tranId, amount: paidPaisa });
  return Response.json({ result: 'VALIDATED', orderNo, tranId });
}
