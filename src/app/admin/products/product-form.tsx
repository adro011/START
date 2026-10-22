'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';
import { saveProduct } from './actions';

interface Img { id: string; url: string; alt: string; name: string; }
interface ColorOpt { name: string; hex: string; }

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS: ColorOpt[] = [
  { name: 'Black', hex: 'var(--abrar-ink)' },
  { name: 'Terracotta', hex: '#D5573B' },
];

type Initial = Record<string, unknown> & {
  compare_at_paisa?: number | null;
  sizes?: string[];
  colors?: ColorOpt[];
  stock?: Record<string, number>;
  images?: Img[];
};

export default function ProductForm({ initial }: { initial?: Record<string, unknown> }) {
  const src = (initial ?? {}) as Initial;
  const [name, setName] = useState(String(src.name ?? ''));
  const [slug, setSlug] = useState(String(src.slug ?? ''));
  const [section, setSection] = useState(String(src.section ?? 'men'));
  const [category, setCategory] = useState(String((src as { category?: string }).category ?? ''));
  const [price, setPrice] = useState(String((src as { price_paisa?: number }).price_paisa ?? ''));
  const [compareAt, setCompareAt] = useState(src.compare_at_paisa ? String(src.compare_at_paisa) : '');
  const [active, setActive] = useState(Boolean((src as { active?: boolean }).active ?? true));
  const [sizes, setSizes] = useState<string[]>(Array.isArray(src.sizes) && src.sizes.length > 0 ? src.sizes : DEFAULT_SIZES);
  const [colors, setColors] = useState<ColorOpt[]>(Array.isArray(src.colors) && src.colors.length > 0 ? src.colors : DEFAULT_COLORS);
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [stock, setStock] = useState<Record<string, number>>(src.stock ?? {});
  const [images, setImages] = useState<Img[]>(Array.isArray(src.images) ? src.images : []);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  function key(s: string, c: string) { return `${s}__${c}`; }

  function onFiles(files: FileList | null) {
    if (!files) return;
    if (images.length + files.length > 5) { setError('Max 5 images per product (enforced).'); return; }
    setError('');
    const next: Img[] = [...images];
    for (const f of Array.from(files).slice(0, 5 - images.length)) {
      next.push({ id: `${Date.now()}-${f.name}`, url: URL.createObjectURL(f), alt: '', name: f.name });
    }
    setImages(next);
  }

  function move(dragged: string, target: string) {
    if (dragged === target) return;
    const arr = [...images];
    const from = arr.findIndex((i) => i.id === dragged);
    const to = arr.findIndex((i) => i.id === target);
    if (from < 0 || to < 0) return;
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    setImages(arr);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missingAlt = images.filter((i) => !i.alt.trim());
    if (missingAlt.length > 0) { setError('Alt text is required for every image.'); return; }
    if (images.length > 5) { setError('Max 5 images per product (enforced).'); return; }
    setError('');
    setSaving(true);
    const result = await saveProduct({
      id: (src as { id?: string }).id,
      name, slug, category,
      section: section as "men" | "women" | "kids",
      price_paisa: Number(price),
      compare_at_paisa: compareAt ? Number(compareAt) : null,
      active, sizes, colors, stock,
      images: images.map((i, idx) => ({ position: idx + 1, alt: i.alt, name: i.name })),
    });
    setSaving(false);
    if (result.ok) {
      setToast('Saved.');
      window.setTimeout(() => setToast(''), 3000);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {toast ? <p role="status" className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">{toast}</p> : null}

      <fieldset className="rounded-lg border border-white/15 p-4">
        <legend className="px-1 text-sm font-semibold">Basic</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">Name<input value={name} onChange={(e) => setName(e.target.value)} required className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
          <label className="block text-sm">Slug<input value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
          <label className="block text-sm">Section
            <select value={section} onChange={(e) => setSection(e.target.value)} className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2">
              <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
            </select>
          </label>
          <label className="block text-sm">Category slug<input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="panjabi" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 p-4">
        <legend className="px-1 text-sm font-semibold">Pricing & visibility</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">Price (paisa)<input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" required className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
          <label className="block text-sm">Compare-at (paisa)<input value={compareAt} onChange={(e) => setCompareAt(e.target.value)} inputMode="numeric" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Published</label>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 p-4">
        <legend className="px-1 text-sm font-semibold">Variant matrix (sizes × colors → stock)</legend>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="font-medium">Sizes:</span>
          {sizes.map((s) => (
            <button key={s} type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))} title={`Remove ${s}`} className="rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/15">{s} ×</button>
          ))}
          <input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="w-24 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
          <button type="button" onClick={() => { if (newSize.trim()) { setSizes([...sizes, newSize.trim()]); setNewSize(''); } }} className="rounded border border-white/15 px-2 py-1">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Colors:</span>
          {colors.map((c) => (
            <button key={c.name} type="button" onClick={() => setColors(colors.filter((x) => x.name !== c.name))} title={`Remove ${c.name}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/15">
              <span className="inline-block h-3 w-3 rounded-full border border-white/15" style={{ background: c.hex }} />{c.name} ×
            </button>
          ))}
          <input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add color" className="w-28 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
          <button type="button" onClick={() => { if (newColor.trim()) { setColors([...colors, { name: newColor.trim(), hex: '#7E9181' }]); setNewColor(''); } }} className="rounded border border-white/15 px-2 py-1">Add</button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead><tr><th className="border border-white/15 bg-[var(--color-charcoal)] px-2 py-1.5 text-left">Size ↓ · Color →</th>{colors.map((c) => <th key={c.name} className="border border-white/15 bg-[var(--color-charcoal)] px-2 py-1.5">{c.name}</th>)}</tr></thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s}>
                  <th className="border border-white/15 px-2 py-1.5 text-left font-medium">{s}</th>
                  {colors.map((c) => (
                    <td key={c.name} className="border border-white/15 px-2 py-1.5">
                      <input type="number" min={0} value={stock[key(s, c.name)] ?? ''} onChange={(e) => setStock({ ...stock, [key(s, c.name)]: Number(e.target.value) })} placeholder="0" aria-label={`Stock ${s} ${c.name}`} className="w-20 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 p-4">
        <legend className="px-1 text-sm font-semibold">Images (max 5 · drag to reorder · alt required)</legend>
        <p className="text-xs text-ash">Client note: images are compressed to WebP thumb/medium/large + blur placeholder on upload (stub — wire to browser-image-compression + Storage bucket product-images).</p>
        <input type="file" accept="image/*" multiple disabled={images.length >= 5} onChange={(e) => onFiles(e.target.files)} aria-label="Upload product images" className="mt-2 text-sm" />
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {images.map((img, idx) => (
            <li key={img.id} draggable onDragStart={() => setDragId(img.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragId) move(dragId, img.id); setDragId(null); }}
              className={cn('flex gap-3 rounded border border-white/15 p-2', dragId === img.id && 'opacity-50')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-ash">#{idx + 1} · {img.name} · drag to reorder</p>
                <input value={img.alt} onChange={(e) => setImages(images.map((x) => x.id === img.id ? { ...x, alt: e.target.value } : x))} placeholder="Alt text (required)" aria-label={`Alt for image ${idx + 1}`} className="mt-1 w-full textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1 text-sm" />
                <button type="button" onClick={() => setImages(images.filter((x) => x.id !== img.id))} className="mt-1 text-xs text-red-700 hover:underline">Remove</button>
              </div>
            </li>
          ))}
        </ul>
        {images.length === 0 ? <p className="mt-2 text-sm text-ash">No images yet.</p> : null}
      </fieldset>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded bg-gold px-4 py-2.5 text-sm font-medium text-black hover:bg-gold-dark disabled:opacity-50">{saving ? 'Saving…' : 'Save product'}</button>
        <span className="self-center text-xs text-ash">{saving ? 'Writing to Supabase…' : 'Submit → Supabase + revalidatePath.'}</span>
      </div>
    </form>
  );
}
