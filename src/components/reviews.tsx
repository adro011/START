"use client";

import { useState, type FormEvent } from "react";

type Review = { name: string; rating: number; title: string; body: string; date: string };

const DEMO: Review[] = [
  { name: "Tanvir H.", rating: 5, title: "Perfect Eid fit", body: "Fabric feels premium, stitching is clean. Size M fits exactly as the guide says.", date: "2026-08-14" },
  { name: "Nusrat J.", rating: 4, title: "Lovely colour", body: "Colour is slightly deeper than photos but quality is excellent. Delivery took 3 days to Dhaka.", date: "2026-09-02" },
];

function Stars({ n }: { n: number }) {
  return <span aria-label={`${n} out of 5 stars`}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function Reviews({ slug, rating, reviewCount }: { slug: string; rating: number; reviewCount: number }) {
  const [list, setList] = useState<Review[]>(DEMO);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stars, setStars] = useState(5);
  const [done, setDone] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setList((l) => [{ name: name.trim(), rating: stars, title: title.trim() || "Review", body: body.trim(), date: new Date().toISOString().slice(0, 10) }, ...l]);
    setName("");
    setTitle("");
    setBody("");
    setDone(true);
  }

  return (
    <section aria-label="Reviews" className="mt-10">
      <h2 className="text-lg font-semibold">
        Reviews · <Stars n={Math.round(rating)} /> {rating.toFixed(1)} ({reviewCount + list.length - DEMO.length} verified)
      </h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {list.map((r, i) => (
            <article key={`${r.name}-${i}`} className="rounded-xl border p-3">
              <p className="text-sm font-medium">{r.title} <span className="ml-1 text-amber-500"><Stars n={r.rating} /></span></p>
              <p className="mt-1 text-sm">{r.body}</p>
              <p className="mt-1 text-xs text-neutral-600">{r.name} · {r.date} · product {slug}</p>
            </article>
          ))}
        </div>
        <form onSubmit={submit} className="h-fit space-y-2 rounded-xl border p-4">
          <h3 className="font-medium">Write a review</h3>
          <label className="block text-sm">
            Rating
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="ml-2 rounded border px-2 py-1">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="w-full rounded border px-3 py-2 text-sm" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full rounded border px-3 py-2 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Fit, fabric, delivery…" required rows={3} className="w-full rounded border px-3 py-2 text-sm" />
          <p className="text-xs text-neutral-600">Photos: max 3 per review (upload coming with accounts — describe them for now).</p>
          <button type="submit" className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white">
            Submit review
          </button>
          {done && <p className="text-xs text-green-700">Thanks! Your review is visible below (demo — no moderation yet).</p>}
        </form>
      </div>
    </section>
  );
}
