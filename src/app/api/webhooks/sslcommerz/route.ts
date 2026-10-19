import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDemoOrder } from "@/lib/admin-data";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  buildValidationUrl,
  isFailedGatewayStatus,
  isSuccessfulGatewayStatus,
  isValidationSuccess,
  normaliseIpn,
  parseIpnPayload,
  takaToPaisa,
} from "@/lib/sslcommerz";

// SSLCommerz IPN webhook.
//
// Guarantees (see .opencode/skills/ecommerce-rules "Webhooks"):
// - Idempotent: the first delivery inserts payments(tran_id) with
//   ON CONFLICT DO NOTHING; any later delivery of the same tran_id hits the
//   unique constraint (or the already-paid check) → DUPLICATE, never a
//   double stock/paid update.
// - Verified: the callback payload alone is never trusted — the order is
//   read from the DB (total_paisa is the source of truth, not the post) and
//   the tran_id is re-checked server-to-server via the validation API.
// - Logs: payment received/failed events go to order_events; admin views
//   revalidate after the DB write.

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status });

export async function POST(request: Request): Promise<Response> {
  const raw = await parseIpnPayload(request);
  if (!raw) {
    return json({ result: "FAILED", reason: "invalid-payload" }, 400);
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    // Local dev without Supabase: demo fixtures keep the old stub contract
    // (amount posted in paisa) so the endpoint stays exercisable offline.
    return demoStub(raw);
  }

  const ipn = normaliseIpn(raw);
  if (!ipn) {
    return json({ result: "FAILED", reason: "invalid-fields" }, 400);
  }
  const { orderNo, tranId, valId, currency, status, raw: rr } = ipn;

  // ── 1. Order lookup: totals come from the DB, never from the payload ──────
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, order_no, status, payment_status, total_paisa")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (orderErr) {
    return json({ result: "FAILED", reason: "db-error", orderNo, tranId }, 500);
  }
  if (!order) {
    return json({ result: "FAILED", reason: "order-not-found", orderNo, tranId }, 404);
  }
  const o = order as { id: string; payment_status: string; total_paisa: number };

  // ── 2. Idempotency: already applied? ──────────────────────────────────────
  if (o.payment_status === "paid") {
    return json({ result: "DUPLICATE", orderNo, tranId });
  }

  // ── 3. Terminal failure → mark once, log once; replays hit 0 rows ─────────
  if (isFailedGatewayStatus(status)) {
    return markFailed(admin, o, "Payment failed (SSLCommerz)");
  }

  // PENDING (customer still on gateway): no state change until a terminal IPN.
  if (!isSuccessfulGatewayStatus(status)) {
    return json({ result: "PENDING", orderNo, tranId });
  }

  // ── 4. Server-to-server validation (callback alone is never trusted) ──────
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePass = process.env.SSLCOMMERZ_STORE_PASS;
  const endpoint = process.env.SSLCOMMERZ_ENDPOINT ?? "https://securepay.sslcommerz.com";
  if (!storeId || !storePass) {
    return json({ result: "FAILED", reason: "gateway-not-configured", orderNo, tranId }, 500);
  }

  let validated: { status?: string; currency?: string; amount?: number | string } | null = null;
  try {
    const res = await fetch(buildValidationUrl({ endpoint, storeId, storePass, valId }), {
      method: "GET",
      cache: "no-store",
    });
    validated = (await res.json()) as { status?: string; currency?: string; amount?: number | string };
  } catch {
    // Unreachable gateway is transient — do not fail the payment; the IPN
    // sender retries and the payments row is only written when verified.
    return json({ result: "FAILED", reason: "validator-unreachable", orderNo, tranId }, 502);
  }
  if (!validated || !isValidationSuccess(validated)) {
    return markFailed(admin, o, "Payment validation rejected by gateway");
  }

  // ── 5. Amount + currency from the VALIDATION response vs DB order total ───
  const paidPaisa = takaToPaisa(validated.amount ?? NaN);
  if (!Number.isFinite(paidPaisa) || currency !== "BDT" || paidPaisa !== o.total_paisa) {
    return markFailed(admin, o, "Payment amount or currency mismatch");
  }

  // ── 6. Record the payment first (unique tran_id = idempotency line) ───────
  const { data: paymentRow, error: payError } = await admin
    .from("payments")
    .upsert(
      {
        order_id: o.id,
        tran_id: tranId,
        val_id: valId,
        amount_paisa: paidPaisa,
        currency,
        status: "approved",
        raw: rr,
      },
      { onConflict: "tran_id", ignoreDuplicates: true },
    )
    .select("id");
  if (payError) {
    // A genuine write failure (not a replay) — 500 so the gateway retries.
    return json({ result: "FAILED", reason: "db-error", orderNo, tranId }, 500);
  }
  if (!paymentRow || paymentRow.length === 0) {
    // ON CONFLICT DO NOTHING matched an existing tran_id → replayed delivery.
    return json({ result: "DUPLICATE", orderNo, tranId });
  }

  // ── 7. Mark paid (conditional, idempotent) + event ────────────────────────
  const { data: updated } = await admin
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", o.id)
    .eq("payment_status", "unpaid")
    .select("id");
  if (updated && updated.length > 0) {
    await admin.from("order_events").insert({
      order_id: o.id,
      status: "paid",
      note: "Payment received via SSLCommerz",
      actor: "system",
    });
    revalidatePath("/admin/orders");
  }

  return json({ result: "VALIDATED", orderNo, tranId });
}

// ─────────────────────────────────────────────────────────────────────────────
// Failure path: flip unpaid → failed once; every replay updates 0 rows so the
// order_events row is written only for the first delivery.
async function markFailed(
  admin: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  order: { id: string },
  note: string,
): Promise<Response> {
  const { data: updated } = await admin
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", order.id)
    .eq("payment_status", "unpaid")
    .select("id");
  if (updated && updated.length > 0) {
    await admin.from("order_events").insert({
      order_id: order.id,
      status: "failed",
      note,
      actor: "system",
    });
    revalidatePath("/admin/orders");
  }
  return json({ result: "FAILED", reason: "gateway-rejected", orderId: order.id });
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo stub for local dev (no Supabase env): admin fixtures, in-memorySet
// idempotency, amount posted in paisa. Not for production use.
const DemoIpnSchema = z.object({
  orderNo: z.string().min(1),
  amount: z.coerce.number().positive(),
  status: z.string().min(1),
  tranId: z.string().min(1),
});
const seenTranIds = new Set<string>();

function demoStub(raw: Record<string, string>): Response {
  const parsed = DemoIpnSchema.safeParse({
    orderNo: raw.orderNo ?? raw.order_no,
    amount: raw.amount,
    status: raw.status,
    tranId: raw.tranId ?? raw.tran_id,
  });
  if (!parsed.success) {
    return json({ result: "FAILED", reason: "invalid-fields" }, 400);
  }
  const { orderNo, amount, status, tranId } = parsed.data;
  if (seenTranIds.has(tranId)) {
    return json({ result: "DUPLICATE", orderNo, tranId });
  }
  const order = getDemoOrder(orderNo);
  if (!order) {
    return json({ result: "FAILED", reason: "order-not-found" }, 404);
  }
  const paidPaisa = Math.round(amount); // demo contract: amount is already paisa
  const okStatus = status === "VALID" || status === "VALIDATED";
  if (!okStatus || paidPaisa !== order.totalPaisa) {
    return json({ result: "FAILED", orderNo, expected: order.totalPaisa, received: paidPaisa }, 422);
  }
  seenTranIds.add(tranId);
  console.log("sslcommerz webhook VALIDATED (demo stub) →", { orderNo, tranId, amount: paidPaisa });
  return json({ result: "VALIDATED", orderNo, tranId });
}
