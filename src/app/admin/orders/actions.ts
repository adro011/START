"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const STATE_MACHINE: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
};

/** Admin fixtures use non-UUID ids (e.g. "demo-1"); only real orders hit the DB. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function advanceStatus(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const newStatus = String(formData.get("to") ?? "");
  if (!orderId || !newStatus) throw new Error("Missing orderId or status");
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to update

  const supabase = createServiceRoleClient();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) throw new Error("Order not found");

  const allowed = STATE_MACHINE[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase.from("order_events").insert({
    order_id: orderId,
    status: newStatus,
    note: `Status advanced to ${newStatus}`,
    actor: "staff",
  });

  if (eventErr) throw eventErr;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function assignCourier(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const courier = String(formData.get("courier") ?? "").trim();
  const trackingNo = String(formData.get("tracking") ?? "").trim();
  if (!orderId || !courier) throw new Error("Missing orderId or courier");
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to update

  const supabase = createServiceRoleClient();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("orders")
    .update({ courier, tracking_no: trackingNo, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrder(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing orderId");
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to cancel

  const supabase = createServiceRoleClient();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.rpc("cancel_order", { p_order: orderId });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
