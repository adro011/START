"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({
  variant: z.string().min(1),
  email: z.string().email(),
});

export default function BackInStock({ sku }: { sku: string | null }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const parsed = schema.safeParse({ variant: sku ?? "", email: email.trim() });
    if (!parsed.success) {
      setMsg("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("failed");
      setMsg("You're on the list — we'll email you when it's back.");
      setEmail("");
    } catch {
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!sku) return null;

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl border border-dashed p-3">
      <p className="text-sm font-medium">Out of stock? Get notified</p>
      <div className="mt-2 flex gap-2">
        <div className="textInputWrapper min-w-0 flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email for back-in-stock alert"
            className="textInput w-full py-2 px-3 placeholder:text-ash outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-black hover:bg-gold-dark disabled:opacity-50"
        >
          {loading ? "…" : "Notify me"}
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-ash">{msg}</p>}
    </form>
  );
}
