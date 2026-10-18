"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { useCart } from "@/store/cart";
import { formatBDT } from "@/lib/format";
import { placeOrder } from "@/actions/checkout";

/** ~8 BD divisions with representative districts (demo list). */
export const DIVISIONS: { name: string; districts: string[] }[] = [
  { name: "Dhaka", districts: ["Dhaka", "Gazipur", "Narayanganj", "Munshiganj", "Narsingdi"] },
  { name: "Chattogram", districts: ["Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Noakhali"] },
  { name: "Rajshahi", districts: ["Rajshahi", "Bogra", "Pabna", "Natore", "Sirajganj"] },
  { name: "Khulna", districts: ["Khulna", "Jessore", "Satkhira", "Kushtia", "Bagerhat"] },
  { name: "Barishal", districts: ["Barishal", "Patuakhali", "Bhola", "Pirojpur"] },
  { name: "Sylhet", districts: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"] },
  { name: "Rangpur", districts: ["Rangpur", "Dinajpur", "Kurigram", "Lalmonirhat"] },
  { name: "Mymensingh", districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"] },
];

const phoneRegex = /^01[3-9]\d{8}$/;

export default function CheckoutForm({ sslEnabled }: { sslEnabled: boolean }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState(DIVISIONS[0].name);
  const [district, setDistrict] = useState(DIVISIONS[0].districts[0]);
  const [area, setArea] = useState("");
  const [line1, setLine1] = useState("");
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState<"cod" | "sslcommerz">("cod");
  const [company, setCompany] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const districts = useMemo(
    () => DIVISIONS.find((d) => d.name === division)?.districts ?? [],
    [division],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!phoneRegex.test(phone.trim())) {
      setError("Enter a valid BD mobile number (e.g. 01712345678).");
      return;
    }
    if (!area.trim() || !line1.trim()) {
      setError("Please complete your area and street address.");
      return;
    }
    if (payment === "sslcommerz" && !sslEnabled) {
      setError("Online payment is not enabled in this environment. Choose COD.");
      return;
    }
    setLoading(true);
    try {
      const res = await placeOrder({
        items: items.map((i) => ({ slug: i.slug, sku: i.sku, qty: i.qty })),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        division,
        district,
        area: area.trim(),
        line1: line1.trim(),
        notes: notes.trim(),
        coupon: coupon.trim(),
        payment,
        company,
        turnstileToken: "",
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      try {
        const raw = localStorage.getItem("brand-orders");
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        localStorage.setItem("brand-orders", JSON.stringify([res.orderNo, ...arr].slice(0, 20)));
      } catch {
        /* ignore */
      }
      clear();
      router.push(`/order-success?order=${encodeURIComponent(res.orderNo)}`);
    } finally {
      setLoading(false);
    }
  }

  // Validate phone shape live with zod for consistency
  const phoneSchema = useMemo(() => z.string().regex(phoneRegex), []);
  void phoneSchema;

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <fieldset className="space-y-2 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Contact</legend>
          <div className="textInputWrapper">
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Full name" className="textInput w-full py-2 px-3 bg-[#111111] placeholder:text-ash outline-none" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="textInputWrapper">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="numeric" placeholder="01XXXXXXXXX" aria-describedby="phone-hint" className="textInput w-full py-2 px-3 bg-[#111111] placeholder:text-ash outline-none" />
            </div>
            <div className="textInputWrapper">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (receipt, optional)" className="textInput w-full py-2 px-3 bg-[#111111] placeholder:text-ash outline-none" />
            </div>
          </div>
          <p id="phone-hint" className="text-xs text-ash">BD mobile format: ^01[3-9]\d{8}$ — guest checkout allowed, or sign in later.</p>
        </fieldset>

        <fieldset className="space-y-2 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Delivery address (Bangladesh)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm">
              Division
              <select value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(DIVISIONS.find((d) => d.name === e.target.value)?.districts[0] ?? ""); }} className="mt-1 w-full rounded border border-white/15 bg-[#111111] px-3 py-2 text-[#F5F5F5]">
                {DIVISIONS.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              District
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded border border-white/15 bg-[#111111] px-3 py-2 text-[#F5F5F5]">
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="textInputWrapper">
              <input value={area} onChange={(e) => setArea(e.target.value)} required placeholder="Area (e.g. Mirpur 10)" className="textInput w-full py-2 px-3 bg-[#111111] placeholder:text-ash outline-none" />
            </div>
            <div className="textInputWrapper">
              <input value={line1} onChange={(e) => setLine1(e.target.value)} required minLength={4} placeholder="House / road / landmark" className="textInput w-full py-2 px-3 bg-[#111111] placeholder:text-ash outline-none" />
            </div>
            <div className="textInputWrapper">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes (optional)" rows={2} className="textInput w-full bg-[#111111] border-0 resize-y py-3 placeholder:text-ash outline-none" />
            </div>
        </fieldset>

        <fieldset className="space-y-2 rounded-xl border p-4">
          <legend className="px-1 text-sm font-semibold">Payment</legend>
          <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
            Cash on Delivery (COD) — pay in cash/bKash on receipt
          </label>
          <label className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${sslEnabled ? "" : "opacity-50"}`}>
            <input type="radio" name="payment" checked={payment === "sslcommerz"} disabled={!sslEnabled} onChange={() => setPayment("sslcommerz")} />
            SSLCommerz (bKash / Nagad / cards) {sslEnabled ? "" : "— disabled (set PAYMENT_SSLCOMMERZ_ENABLED=true)"}
          </label>
        </fieldset>

        {/* Turnstile placeholder + honeypot */}
        <div className="rounded-xl border border-dashed p-3 text-xs text-ash" aria-label="Bot protection">
          Turnstile widget placeholder — wire `NEXT_PUBLIC_TURNSTILE_SITE_KEY` here in production.
        </div>
        <input value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" placeholder="Company" />

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>

      <aside className="h-fit space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-2">
              <span className="truncate">{i.name} × {i.qty}</span>
              <span>{formatBDT(i.pricePaisa * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="textInputWrapper">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (optional)" aria-label="Coupon" className="textInput w-full py-2 px-3 bg-[#111111] uppercase placeholder:text-ash outline-none" />
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Subtotal</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <p className="text-xs text-ash">Shipping + discounts recalculated securely on the server.</p>
        <button type="submit" disabled={loading || items.length === 0} className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-black hover:bg-gold-dark disabled:opacity-50">
          {loading ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
