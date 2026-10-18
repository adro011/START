"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { trackOrder, type TrackedOrder } from "@/actions/track";

const schema = z.object({
  orderNo: z.string().regex(/^BR-\d{6}$/, "Format: BR-123456"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number"),
});

const STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

const TERMINAL_STATUSES = ["cancelled", "returned"] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function TrackPage() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ orderNo: orderNo.trim().toUpperCase(), phone: phone.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setOrder(null);
      return;
    }
    setError(null);
    setLoading(true);
    const result = await trackOrder(parsed.data.orderNo, parsed.data.phone);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setOrder(null);
      return;
    }
    setOrder(result.order);
  }

  const step = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;
  const terminal =
    order && (TERMINAL_STATUSES as readonly string[]).includes(order.status);

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Track your order</h1>
      <p className="mt-1 text-sm text-ash">Enter the order no (e.g. BR-100231) + the phone used at checkout.</p>
      <form onSubmit={submit} className="mt-4 space-y-2 rounded-xl border p-4">
        <div className="textInputWrapper">
          <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="BR-123456" aria-label="Order number" className="textInput w-full py-2 px-3 font-mono uppercase placeholder:text-ash outline-none" />
        </div>
        <div className="textInputWrapper">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" aria-label="Phone" inputMode="numeric" className="textInput w-full py-2 px-3 placeholder:text-ash outline-none" />
        </div>
        <button disabled={loading} className="w-full rounded-full bg-gold py-2.5 text-sm font-semibold text-black hover:bg-gold-dark disabled:opacity-60">
          {loading ? "Tracking…" : "Track"}
        </button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      {order && (
        <div className="mt-4 rounded-xl border p-4">
          <p className="text-sm font-medium">Order {order.orderNo} · <span className="capitalize">{order.status}</span></p>
          <p className="mt-0.5 text-xs text-ash">Placed {formatDate(order.createdAt)}</p>
          {terminal ? (
            <p className="mt-3 rounded-lg bg-[#181818] px-3 py-2 text-sm text-steel">
              This order was {order.status}. Contact support if you need help.
            </p>
          ) : (
            <ol className="mt-3 space-y-1.5">
              {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center gap-2 text-sm ${i <= step ? "font-semibold" : "text-steel"}`}>
                  <span aria-hidden>{i <= step ? "●" : "○"}</span>
                  <span className="capitalize">{s}</span>
                </li>
              ))}
            </ol>
          )}
          {(order.courier || order.trackingNo) && (
            <p className="mt-3 text-xs text-ash">
              {order.courier && <span>Courier: {order.courier}</span>}
              {order.courier && order.trackingNo && " · "}
              {order.trackingNo && <span>Tracking: <span className="font-mono">{order.trackingNo}</span></span>}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
