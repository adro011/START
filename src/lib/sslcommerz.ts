import { z } from "zod";

// SSLCommerz IPN helpers. Pure functions so webhook processing is testable.
//
// Rules enforced here (see .opencode/skills/ecommerce-rules):
// - Money is integer paisa; gateway sends taka decimals → convert with one
//   rounding step, never keep floats around.
// - The IPN callback alone is never trusted: the route re-checks via the
//   validation API. These helpers only normalise payload/status/URL.
// - tran_id is the idempotency key (unique in payments).

/** IPN fields we act on, normalised. `raw` keeps every posted field for the payments ledger. */
export interface IpnPayload {
  orderNo: string;
  tranId: string;
  valId: string;
  status: string;
  amountPaisa: number;
  currency: string;
  raw: Record<string, string>;
}

const FieldsSchema = z.object({
  tran_id: z.string().min(1),
  val_id: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().min(1),
  status: z.string().min(1),
  orderNo: z.string().min(1).optional(),
  order_no: z.string().min(1).optional(),
});

/** taka decimal string (e.g. "5058.00") → integer paisa ("505800"). */
export function takaToPaisa(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

/** Gateway statuses that mean the payment is good (checked again via val API). */
export function isSuccessfulGatewayStatus(status: string): boolean {
  const s = status.trim().toUpperCase();
  return s === "VALID" || s === "VALIDATED";
}

/** Gateway statuses that mean the payment definitively failed. */
export function isFailedGatewayStatus(status: string): boolean {
  const s = status.trim().toUpperCase();
  return s === "FAILED" || s === "CANCELED" || s === "CANCELLED";
}

/** Accept IPN as JSON or form-urlencoded (SSLCommerz posts form data). */
export async function parseIpnPayload(request: Request): Promise<Record<string, string> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const json: unknown = await request.json();
      if (!json || typeof json !== "object" || Array.isArray(json)) return null;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
        out[k] = String(v ?? "");
      }
      return out;
    }
    const form = await request.formData();
    const out: Record<string, string> = {};
    for (const [k, v] of form.entries()) {
      out[k] = String(v ?? "");
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** Normalise raw IPN fields; null when required fields are missing/invalid. */
export function normaliseIpn(raw: Record<string, string>): IpnPayload | null {
  const parsed = FieldsSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { tran_id, val_id, amount, currency, status, orderNo, order_no } = parsed.data;
  return {
    // Init is expected to pass the BR-… order_no as tran_id; an explicit
    // orderNo/order_no field wins when the sender includes it.
    orderNo: orderNo ?? order_no ?? tran_id,
    tranId: tran_id,
    valId: val_id,
    status,
    amountPaisa: takaToPaisa(amount),
    currency: currency.trim().toUpperCase(),
    raw,
  };
}

export interface ValidationUrlInput {
  endpoint: string;
  storeId: string;
  storePass: string;
  valId: string;
}

/** validator/api/validationserverAPI.php under the configured endpoint. */
export function buildValidationUrl({ endpoint, storeId, storePass, valId }: ValidationUrlInput): string {
  const base = (endpoint || "https://securepay.sslcommerz.com").trim().replace(/\/+$/, "");
  const params = new URLSearchParams({
    val_id: valId,
    store_id: storeId,
    store_passwd: storePass,
    format: "json",
  });
  return `${base}/validator/api/validationserverAPI.php?${params.toString()}`;
}

/** The validation API response must say VALID/VALIDATED in BDT. */
export function isValidationSuccess(v: { status?: string; currency?: string }): boolean {
  const okStatus = v.status === "VALID" || v.status === "VALIDATED";
  const okCurrency = (v.currency ?? "BDT").toUpperCase() === "BDT";
  return okStatus && okCurrency;
}
