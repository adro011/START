'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';
import { getCategory, CATEGORIES } from '@/lib/catalog';
import { saveProduct } from './actions';
import LivePreview from './live-preview';

interface Img { id: string; url: string; alt: string; name: string; }
interface ColorOpt { name: string; hex: string; }

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS: ColorOpt[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'Terracotta', hex: '#D5573B' },
];

interface VariantCell { stock: number; price: string; sku: string; }

type Initial = Record<string, unknown> & {
  compare_at_paisa?: number | null;
  sizes?: string[];
  colors?: ColorOpt[];
  stock?: Record<string, number>;
  variantPrices?: Record<string, number>;
  variantSkus?: Record<string, string>;
  images?: Img[];
  description?: string;
  fabric?: string;
  is_new?: boolean;
  is_sale?: boolean;
  is_featured?: boolean;
};

function toBDT(paisa: number | null | undefined): string {
  if (paisa == null || !Number.isFinite(paisa)) return '';
  return (paisa / 100).toFixed(0);
}

export default function ProductForm({ initial }: { initial?: Record<string, unknown> }) {
  const src = (initial ?? {}) as Initial;
  const [name, setName] = useState(String(src.name ?? ''));
  const [slug, setSlug] = useState(String(src.slug ?? ''));
  const [section, setSection] = useState(String(src.section ?? 'men'));
  const [category, setCategory] = useState(String((src as { category?: string }).category ?? ''));
  const [description, setDescription] = useState(String(src.description ?? ''));
  const [fabric, setFabric] = useState(String(src.fabric ?? ''));
  const [priceBDT, setPriceBDT] = useState(toBDT((src as { price_paisa?: number }).price_paisa));
  const [compareAtBDT, setCompareAtBDT] = useState(toBDT(src.compare_at_paisa));
  const [active, setActive] = useState(Boolean((src as { active?: boolean }).active ?? true));
  const [isNew, setIsNew] = useState(Boolean(src.is_new));
  const [isSale, setIsSale] = useState(Boolean(src.is_sale));
  const [isFeatured, setIsFeatured] = useState(Boolean(src.is_featured));
  const [sizes, setSizes] = useState<string[]>(Array.isArray(src.sizes) && src.sizes.length > 0 ? src.sizes : DEFAULT_SIZES);
  const [colors, setColors] = useState<ColorOpt[]>(Array.isArray(src.colors) && src.colors.length > 0 ? src.colors : DEFAULT_COLORS);
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8CBBD3');
  const [cells, setCells] = useState<Record<string, VariantCell>>(() => {
    const out: Record<string, VariantCell> = {};
    for (const s of src.sizes && src.sizes.length > 0 ? src.sizes : DEFAULT_SIZES) {
      for (const c of src.colors && src.colors.length > 0 ? src.colors : DEFAULT_COLORS) {
        const k = `${s}__${c.name}`;
        out[k] = {
          stock: src.stock?.[k] ?? 0,
          price: src.variantPrices?.[k] != null ? toBDT(src.variantPrices[k]) : '',
          sku: src.variantSkus?.[k] ?? '',
        };
      }
    }
    return out;
  });
  const [images, setImages] = useState<Img[]>(Array.isArray(src.images) ? src.images : []);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  function key(s: string, c: string) { return `${s}__${c}`; }

  function setCell(k: string, patch: Partial<VariantCell>) {
    setCells((prev) => ({ ...prev, [k]: { ...(prev[k] ?? { stock: 0, price: '', sku: '' }), ...patch } }));
  }

  function moveColor(idx: number, dir: -1 | 1) {
    const next = [...colors];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    const [c] = next.splice(idx, 1);
    next.splice(to, 0, c);
    setColors(next);
  }

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

    const pricePaisa = Math.round(parseFloat(priceBDT) * 100);
    const compareAtPaisa = compareAtBDT.trim() ? Math.round(parseFloat(compareAtBDT) * 100) : null;
    if (!Number.isFinite(pricePaisa) || pricePaisa < 0) { setError('Enter a valid non-negative price.'); return; }
    if (compareAtPaisa != null && (!Number.isFinite(compareAtPaisa) || compareAtPaisa <= pricePaisa)) {
      setError('Compare-at price must be greater than the selling price.'); return;
    }

    const variants = sizes.flatMap((s) =>
      colors.map((c) => {
        const k = key(s, c.name);
        const cell = cells[k] ?? { stock: 0, price: '', sku: '' };
        const vp = cell.price.trim() ? Math.round(parseFloat(cell.price) * 100) : null;
        return {
          size: s,
          color: c.name,
          colorHex: c.hex,
          stock: Math.max(0, Number(cell.stock) || 0),
          priceOverridePaisa: vp && Number.isFinite(vp) && vp >= 0 ? vp : null,
          sku: cell.sku.trim() || undefined,
        };
      })
    );

    setError('');
    setSaving(true);
    const result = await saveProduct({
      id: (src as { id?: string }).id,
      name, slug, category,
      description, fabric,
      section: section as "men" | "women" | "kids",
      price_paisa: pricePaisa,
      compare_at_paisa: compareAtPaisa,
      active, is_new: isNew, is_sale: isSale, is_featured: isFeatured,
      variants,
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

  const catName = category ? getCategory(category)?.name ?? category : '';
  const pricePaisa = priceBDT.trim() ? Math.round(parseFloat(priceBDT) * 100) : 0;
  const compareAtPaisa = compareAtBDT.trim() ? Math.round(parseFloat(compareAtBDT) * 100) : null;
  const stockForPreview: Record<string, number> = {};
  const priceForPreview: Record<string, number> = {};
  for (const s of sizes) for (const c of colors) {
    const k = key(s, c.name);
    stockForPreview[k] = cells[k]?.stock ?? 0;
    const vp = cells[k]?.price?.trim() ? Math.round(parseFloat(cells[k].price) * 100) : null;
    if (vp != null && Number.isFinite(vp)) priceForPreview[k] = vp;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <datalist id="category-list">
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </datalist>
      {error ? <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {toast ? <p role="status" className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">{toast}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
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
              <label className="block text-sm">Category slug<input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="punjabi" list="category-list" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
              <label className="block text-sm sm:col-span-2">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
              <label className="block text-sm sm:col-span-2">Fabric<textarea value={fabric} onChange={(e) => setFabric(e.target.value)} rows={1} className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-white/15 p-4">
            <legend className="px-1 text-sm font-semibold">Price &amp; status</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">Price (৳)<input value={priceBDT} onChange={(e) => setPriceBDT(e.target.value)} inputMode="decimal" required className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
              <label className="block text-sm">Compare-at (৳)<input value={compareAtBDT} onChange={(e) => setCompareAtBDT(e.target.value)} inputMode="decimal" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Published</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> New</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isSale} onChange={(e) => setIsSale(e.target.checked)} /> Sale</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured</label>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-white/15 p-4">
            <legend className="px-1 text-sm font-semibold">Available colours</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2 py-1">
                  <label className="relative inline-block h-6 w-6 overflow-hidden rounded-full border border-white/20" style={{ background: c.hex }} title={c.name}>
                    <input type="color" value={c.hex} onChange={(e) => setColors(colors.map((x, xi) => (xi === i ? { ...x, hex: e.target.value } : x)))} aria-label={`${c.name} colour`} className="absolute inset-0 cursor-pointer opacity-0" />
                  </label>
                  <input value={c.name} onChange={(e) => setColors(colors.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))} aria-label={`${c.name} name`} className="w-24 textInput bg-[#111111] text-[var(--color-smoke)] px-2 py-0.5 text-xs" />
                  <input value={c.hex} onChange={(e) => setColors(colors.map((x, xi) => (xi === i ? { ...x, hex: e.target.value } : x)))} aria-label={`${c.name} hex`} pattern="#[0-9a-fA-F]{6}" className="w-20 textInput bg-[#111111] text-[var(--color-smoke)] px-2 py-0.5 font-mono text-xs" />
                  <button type="button" onClick={() => moveColor(i, -1)} aria-label={`Move ${c.name} left`} className="px-1 text-ash hover:text-[var(--color-smoke)]">←</button>
                  <button type="button" onClick={() => moveColor(i, 1)} aria-label={`Move ${c.name} right`} className="px-1 text-ash hover:text-[var(--color-smoke)]">→</button>
                  <button type="button" onClick={() => setColors(colors.filter((x) => x.name !== c.name))} title={`Remove ${c.name}`} className="px-1 text-red-700 hover:text-red-400">×</button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Color name" className="w-32 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} aria-label="New colour picker" className="h-8 w-10 cursor-pointer" />
              <button type="button" onClick={() => { const n = newColorName.trim(); if (n) { setColors([...colors, { name: n, hex: newColorHex }]); setNewColorName(''); } }} className="rounded border border-white/15 px-2 py-1">Add colour</button>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-white/15 p-4">
            <legend className="px-1 text-sm font-semibold">Available sizes</legend>
            <div className="flex flex-wrap gap-2 text-sm">
              {sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSizes(sizes.filter((x) => x !== s))} title={`Remove ${s}`} className="rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/15">{s} ×</button>
              ))}
              <input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Add size" className="w-24 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
              <button type="button" onClick={() => { if (newSize.trim()) { setSizes([...sizes, newSize.trim()]); setNewSize(''); } }} className="rounded border border-white/15 px-2 py-1">Add</button>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-white/15 p-4">
            <legend className="px-1 text-sm font-semibold">Variant matrix (size × colour → stock · price · SKU)</legend>
            <p className="text-xs text-ash">Price ৳ left blank inherits the base price. SKU left blank is auto-generated.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead><tr><th className="border border-white/15 bg-[var(--color-charcoal)] px-2 py-1.5 text-left">Size ↓ · Colour →</th>{colors.map((c) => <th key={c.name} className="border border-white/15 bg-[var(--color-charcoal)] px-2 py-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20 align-middle" style={{ background: c.hex }} /> {c.name}</th>)}</tr></thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s}>
                      <th className="border border-white/15 px-2 py-1.5 text-left font-medium">{s}</th>
                      {colors.map((c) => {
                        const k = key(s, c.name);
                        const cell = cells[k] ?? { stock: 0, price: '', sku: '' };
                        return (
                          <td key={c.name} className="border border-white/15 px-2 py-1.5 align-top">
                            <div className="flex flex-col gap-1">
                              <input type="number" min={0} value={cell.stock} onChange={(e) => setCell(k, { stock: Number(e.target.value) })} placeholder="stock" aria-label={`Stock ${s} ${c.name}`} className="w-16 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
                              <input inputMode="decimal" value={cell.price} onChange={(e) => setCell(k, { price: e.target.value })} placeholder="৳" aria-label={`Price ${s} ${c.name}`} className="w-16 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1" />
                              <input value={cell.sku} onChange={(e) => setCell(k, { sku: e.target.value })} placeholder="sku" aria-label={`SKU ${s} ${c.name}`} className="w-24 textInput bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-2 py-1 font-mono text-xs" />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-white/15 p-4">
            <legend className="px-1 text-sm font-semibold">Images (max 5 · drag to reorder · alt required)</legend>
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
            <span className="self-center text-xs text-ash">{saving ? 'Writing to Supabase…' : 'Submit → Supabase + revalidate.'}</span>
          </div>
        </div>

        {/* Right rail: live preview of the public PDP */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <LivePreview
            name={name}
            categoryName={catName}
            section={section}
            description={description}
            pricePaisa={Number.isFinite(pricePaisa) ? pricePaisa : 0}
            compareAtPaisa={compareAtPaisa}
            isNew={isNew}
            isSale={isSale}
            colors={colors}
            sizes={sizes}
            stock={stockForPreview}
            prices={priceForPreview}
            images={images.map((i) => ({ url: i.url, alt: i.alt }))}
          />
        </div>
      </div>
    </form>
  );
}
