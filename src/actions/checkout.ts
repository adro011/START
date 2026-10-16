"use server";

import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { validateCoupon } from "@/lib/coupons";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";

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

  // Recalculate everything from the catalog — never trust client totals.
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

  // TODO: call Supabase RPC `create_order(cart, address, coupon, payment)` here to
  // decrement stock transactionally, persist order + items + event, and send emails.
  const orderNo = `BR-${Math.floor(100000 + Math.random() * 900000)}`;

  return { ok: true, orderNo, total, subtotal, discount, shipping };
}
