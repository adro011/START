"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({
  orderNo: z.string().regex(/^BR-\d{6}$/, "Format: BR-123456"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid BD mobile number"),
});

const STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

export default function TrackPage() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<{ orderNo: string; step: number } | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ orderNo: orderNo.trim().toUpperCase(), phone: phone.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      setFound(null);
      return;
    }
    setError(null);
    // Demo lookup: deterministic pseudo-status from order number digits.
    const digits = parsed.data.orderNo.replace(/\D/g, "").split("").map(Number);
    const step = digits.reduce((a, b) => a + b, 0) % STEPS.length;
    setFound({ orderNo: parsed.data.orderNo, step });
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Track your order</h1>
      <p className="mt-1 text-sm text-neutral-600">Enter the order no (e.g. BR-100231) + the phone used at checkout.</p>
      <form onSubmit={submit} className="mt-4 space-y-2 rounded-xl border p-4">
        <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="BR-123456" aria-label="Order number" className="w-full rounded border px-3 py-2 font-mono text-sm uppercase" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" aria-label="Phone" inputMode="numeric" className="w-full rounded border px-3 py-2 text-sm" />
        <button className="w-full rounded-full bg-neutral-900 py-2.5 text-sm font-semibold text-white">Track</button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      {found && (
        <div className="mt-4 rounded-xl border p-4">
          <p className="text-sm font-medium">Order {found.orderNo} · {STEPS[found.step]}</p>
          <ol className="mt-3 space-y-1.5">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 text-sm ${i <= found.step ? "font-semibold" : "text-neutral-400"}`}>
                <span aria-hidden>{i <= found.step ? "●" : "○"}</span>
                <span className="capitalize">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-neutral-600">Demo timeline — live tracking connects to courier webhooks in production.</p>
        </div>
      )}
    </main>
  );
}
