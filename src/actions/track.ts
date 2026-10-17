"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const trackSchema = z.object({
  orderNo: z.string().regex(/^BR-\d{6}$/, "Format: BR-123456"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number"),
});

export type TrackedOrder = {
  orderNo: string;
  status: string;
  courier: string | null;
  trackingNo: string | null;
  createdAt: string;
};

export type TrackResult =
  | { ok: true; order: TrackedOrder }
  | { ok: false; error: string };

/**
 * Look up a guest order by order number + checkout phone via the
 * SECURITY DEFINER `track_order` RPC (RLS blocks direct anon reads on
 * orders). Returns null-data as a not-found error so no internals leak.
 */
export async function trackOrder(orderNo: string, phone: string): Promise<TrackResult> {
  const parsed = trackSchema.safeParse({
    orderNo: orderNo.trim().toUpperCase(),
    phone: phone.trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const client = await createClient();
  if (!client) {
    return { ok: false, error: "Tracking is temporarily unavailable. Please try again later." };
  }

  const { data, error } = await client.rpc("track_order", {
    p_order_no: parsed.data.orderNo,
    p_phone: parsed.data.phone,
  });
  if (error) {
    console.warn("track_order rpc failed:", error.message);
    return { ok: false, error: "Tracking is temporarily unavailable. Please try again later." };
  }
  if (!data) {
    return { ok: false, error: "No order matches that order number and phone." };
  }

  const row = data as {
    order_no: string;
    status: string;
    courier: string | null;
    tracking_no: string | null;
    created_at: string;
  };
  return {
    ok: true,
    order: {
      orderNo: row.order_no,
      status: row.status,
      courier: row.courier,
      trackingNo: row.tracking_no,
      createdAt: row.created_at,
    },
  };
}
