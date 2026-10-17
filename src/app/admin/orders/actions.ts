"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { canTransition } from "@/lib/order-state-machine";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/** Admin fixtures use non-UUID ids (e.g. "demo-1"); only real orders hit the DB. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server actions are reachable as public POST endpoints — every action must
 * gate on requireStaff() before any DB call. Real admin sessions carry a
 * Supabase JWT (RLS applies); demo-cookie sessions have no JWT, so a
 * service-role client is used as a dev-only fallback (DB triggers still run).
 */
async function resolveClient(): Promise<Client | null> {
  const session = await requireStaff();
  const userClient = await createClient();
  if (userClient) return userClient;
  if (session.isDev) return createServiceRoleClient();
  return null;
}

type Client = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export async function advanceStatus(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const newStatus = String(formData.get("to") ?? "");
  if (!orderId || !newStatus) throw new Error("Missing orderId or status");
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to update

  const client = await resolveClient();
  if (!client) {
    throw new Error("Supabase not configured — sign in with a staff account to manage live orders.");
  }

  const { data: order, error: fetchErr } = await client
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) throw new Error("Order not found");

  const current = String((order as { status: string }).status);
  if (!canTransition(current, newStatus)) {
    throw new Error(`Cannot transition from ${current} to ${newStatus}`);
  }

  // Atomic guarded transition: conditional on the status we validated.
  // The DB trigger rejects anything raced or illegal, and writes the
  // order_events row in the same transaction.
  const { data: updated, error: updateErr } = await client
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .eq("status", current)
    .select("id");

  if (updateErr) {
    throw new Error(updateErr.message.replace("Illegal status transition:", "Cannot transition:"));
  }
  if (!updated || updated.length === 0) {
    throw new Error(`Order changed concurrently (${current} → ${newStatus} aborted). Reload and retry.`);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function assignCourier(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const courier = String(formData.get("courier") ?? "").trim();
  const trackingNo = String(formData.get("tracking") ?? "").trim();
  if (!orderId || !courier) throw new Error("Missing orderId or courier");
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to update

  const client = await resolveClient();
  if (!client) {
    throw new Error("Supabase not configured — sign in with a staff account to manage live orders.");
  }

  const { error } = await client
    .from("orders")
    .update({ courier, tracking_no: trackingNo })
    .eq("id", orderId);

  if (error) throw error;

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function cancelOrder(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Missing orderId");
  await requireStaff(); // authorize even for fixtures (no-op for demo ids)
  if (!UUID_RE.test(orderId)) return; // demo fixture — no DB row to cancel

  const client = await resolveClient();
  if (!client) {
    throw new Error("Supabase not configured — sign in with a staff account to cancel live orders.");
  }

  // cancel_order checks is_staff_or_admin() on the caller's JWT. The
  // service-role fallback (dev/demo session) has no JWT → the RPC reports
  // Forbidden; that is the correct signal for dev, not something to bypass.
  const { error } = await client.rpc("cancel_order", { p_order: orderId });
  if (error) {
    if (error.message === "Forbidden") {
      throw new Error("Sign in with a Supabase staff account to cancel live orders.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
