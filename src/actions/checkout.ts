"use server";

import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { validateCoupon } from "@/lib/coupons";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const itemSchema = z.object({
  slug: z.string().min(1),
  sku: z.string().min(1),
  qty: z.number().int().min(1).max(10),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number (e.g. 01712345678)"),
  email: z.string().email().optional().or(z.literal("")),
  division: z.string().min(1),
  district: z.string().min(1),
  area: z.string().min(1),
  line1: z.string().min(4).max(200),
  notes: z.string().max(500).optional().or(z.literal("")),
  coupon: z.string().max(20).optional().or(z.literal("")),
  payment: z.enum(["cod", "sslcommerz"]),
  // Bot protection: honeypot must stay empty; turnstile token placeholder.
  company: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutResult =
  | { ok: true; orderNo: string; total: number; subtotal: number; discount: number; shipping: number }
  | { ok: false; error: string; field?: string };

/** Dhaka city districts that qualify for the Dhaka shipping zone. */
function isDhakaZone(district: string): boolean {
  const d = district.trim().toLowerCase();
  return d === "dhaka" || d === "gazipur" || d === "narayanganj";
}

export async function placeOrder(raw: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid checkout data.", field: String(first?.path?.[0] ?? "") };
  }
  const input = parsed.data;

  if (input.company && input.company.length > 0) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  if (input.payment === "sslcommerz" && process.env.PAYMENT_SSLCOMMERZ_ENABLED !== "true") {
    return { ok: false, error: "Online payment is not enabled right now. Please choose Cash on Delivery." };
  }

  // Live path: Supabase RPC `create_order` (transactional stock decrement,
  // DB repricing, coupon + zone logic, order + items + event persistence).
  // Falls back to the local demo repricer when env is missing OR when the
  // cart holds TS-catalog items with no DB variant yet (catalog unification
  // is a follow-up; the RPC activates automatically once slugs match).
  const live = await tryLiveOrder(input);
  if (live) return live;

  // Demo path: recalculate everything from the catalog — never trust client totals.
  let subtotal = 0;
  for (const item of input.items) {
    const product = getProduct(item.slug);
    if (!product) return { ok: false, error: `Unknown product: ${item.slug}` };
    const variant = product.variants.find((v) => v.sku === item.sku);
    if (!variant) return { ok: false, error: `Unknown variant ${item.sku} for ${product.name}` };
    if (variant.stock < item.qty) {
      return { ok: false, error: `Only ${variant.stock} left for ${product.name} (${variant.size}/${variant.color}).` };
    }
    const unit = variant.priceOverridePaisa ?? product.pricePaisa;
    subtotal += unit * item.qty;
  }

  const coupon = (input.coupon ?? "").trim().toUpperCase();
  let discount = 0;
  let freeShip = false;
  if (coupon !== "") {
    // Single source of truth for coupon rules (percent cap, min subtotal).
    const v = validateCoupon(coupon, subtotal);
    if (!v.valid) return { ok: false, error: v.reason ?? "Invalid coupon code." };
    discount = v.discount_paisa;
    freeShip = v.freeShipping;
  }

  const dhaka = isDhakaZone(input.district);
  let shipping = dhaka ? 6000 : 12000;
  const afterDiscount = subtotal - discount;
  if (afterDiscount >= FREE_SHIP_THRESHOLD_PAISA) shipping = 0;
  if (freeShip) shipping = 0;

  const total = afterDiscount + shipping;

  const orderNo = `BR-${Math.floor(100000 + Math.random() * 900000)}`;

  return { ok: true, orderNo, total, subtotal, discount, shipping };
}

type ParsedInput = z.infer<typeof checkoutSchema>;

/**
 * Attempt a real transactional order via `create_order`.
 * Returns the CheckoutResult on success, a user-facing error when the DB
 * rejects the order (stock, coupon, zone), or null when live ordering is
 * unavailable (no env, or cart items have no DB variant) → caller falls
 * back to the demo repricer.
 */
async function tryLiveOrder(
  input: ParsedInput,
): Promise<CheckoutResult | null> {
  try {
    const anon = await createClient();
    const admin = createServiceRoleClient();
    if (!anon || !admin) return null;

    // Resolve TS cart lines (slug/sku) to DB variant uuids.
    const cart: { variant_id: string; qty: number }[] = [];
    for (const item of input.items) {
      const { data, error } = await admin
        .from("product_variants")
        .select("id, products!inner(slug, active, deleted_at)")
        .eq("sku", item.sku)
        .single();
      if (error || !data) return null; // no DB variant yet → demo fallback
      const prod = data.products as unknown as {
        slug: string;
        active: boolean;
        deleted_at: string | null;
      };
      if (!prod || prod.active !== true || prod.deleted_at !== null) return null;
      cart.push({ variant_id: data.id as string, qty: item.qty });
    }
    if (cart.length === 0) return null;

    // RPC is case-sensitive on coupon codes — normalize before sending.
    const coupon = (input.coupon ?? "").trim().toUpperCase() || null;

    const { data, error } = await anon.rpc("create_order", {
      p_cart: cart,
      p_address: {
        name: input.name,
        phone: input.phone,
        email: input.email || "",
        division: input.division,
        district: input.district,
        area: input.area,
        line1: input.line1,
        notes: input.notes || "",
      },
      p_coupon: coupon,
      p_payment: input.payment,
    });
    if (error) {
      return { ok: false, error: friendlyRpcError(error.message) };
    }
    const created = data as unknown as {
      id: string;
      order_no: string;
      total_paisa: number;
    } | null;
    if (!created?.order_no) {
      return { ok: false, error: "Order could not be placed. Please try again." };
    }

    // Authoritative breakdown for the receipt (service-role read).
    const { data: row } = await admin
      .from("orders")
      .select("subtotal_paisa, discount_paisa, shipping_paisa, total_paisa")
      .eq("id", created.id)
      .single();
    const r = row as unknown as {
      subtotal_paisa: number;
      discount_paisa: number;
      shipping_paisa: number;
      total_paisa: number;
    } | null;
    return {
      ok: true,
      orderNo: created.order_no,
      total: r?.total_paisa ?? created.total_paisa,
      subtotal: r?.subtotal_paisa ?? 0,
      discount: r?.discount_paisa ?? 0,
      shipping: r?.shipping_paisa ?? 0,
    };
  } catch (e) {
    console.warn("checkout: live order failed, demo fallback", e);
    return null;
  }
}

/** Map PostgREST/RPC errors to user-facing messages (no internals leaked). */
function friendlyRpcError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("insufficient stock")) return "Some items just sold out. Please adjust quantities.";
  if (m.includes("variant not found")) return "A variant is no longer available. Please re-add it to your bag.";
  if (m.includes("invalid coupon") || m.includes("minimum subtotal") || m.includes("coupon"))
    return "That coupon code is not valid for this order.";
  if (m.includes("shipping zone") || m.includes("district"))
    return "We could not determine shipping for that district. Please check the address.";
  return "Order could not be placed. Please try again.";
}
