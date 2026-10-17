"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { saveRegistryProduct } from "./actions";
import { cn } from "@/lib/format";

const MAX_IMAGES = 5;

const CLOTHING_SIZES: readonly string[] = ["S", "M", "L", "XL", "XXL", "XXXL"];
const SHOE_SIZES: readonly string[] = Array.from({ length: 11 }, (_, i) => String(36 + i)); // 36 .. 46
const AGE_CATEGORIES: readonly string[] = [
  "(0-4)",
  "(4-6)",
  "(6-8)",
  "(8-10)",
  "(10-12)",
  "(12-14)",
  "(14-16)",
  "(16-19)",
  "ADULT",
];

type TypeValue = "male" | "female" | "children" | "others";
type StatusValue = "draft" | "published";

const TYPE_LABELS: Record<TypeValue, string> = {
  male: "Men",
  female: "Women",
  children: "Children",
  others: "Others (new arrivals)",
};

const INPUT =
  "w-full rounded border border-white/15 bg-[#111111] px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-ash";

export const registryFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  slug: z.string().trim().min(2, "Slug is required.").max(100).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  type: z.enum(["male", "female", "children", "others"] as [string, ...string[]]),
  ageCategory: z.enum(AGE_CATEGORIES as [string, ...string[]]).optional(),
  size: z.string(),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than 0."),
  status: z.enum(["draft", "published"] as [string, ...string[]]),
  images: z.array(z.instanceof(File)).max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images per product.`),
})
  .refine((data) => data.type !== "children" || !!data.ageCategory, {
    message: "Age category is required for children.",
    path: ["ageCategory"],
  })
  .refine((data) => {
    const allowed = data.type === "others" ? SHOE_SIZES : CLOTHING_SIZES;
    return allowed.includes(data.size);
  }, {
    message: "Choose a valid size for this type.",
    path: ["size"],
  });

export default function ProductForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<TypeValue>("male");
  const [ageCategory, setAgeCategory] = useState("");
  const [size, setSize] = useState(CLOTHING_SIZES[0]);
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<StatusValue>("draft");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, setSaving] = useState(false);

  const allowedSizes = type === "others" ? SHOE_SIZES : CLOTHING_SIZES;

  function onTypeChange(value: TypeValue) {
    setType(value);
    setSize((value === "others" ? SHOE_SIZES : CLOTHING_SIZES)[0]);
    setAgeCategory("");
    setFieldErrors({});
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    if (files.length + fileList.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images per product.`);
      return;
    }
    setError("");
    const next = [...files];
    const nextPreviews = [...previews];
    for (const f of Array.from(fileList).slice(0, MAX_IMAGES - files.length)) {
      next.push(f);
      nextPreviews.push(URL.createObjectURL(f));
    }
    setFiles(next);
    setPreviews(nextPreviews);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    setError("");
  }

  function fieldError(key: string) {
    return fieldErrors[key]?.[0];
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setFieldErrors({});
    setSaving(true);
    try {
      const parsed = registryFormSchema.safeParse({
        name,
        slug,
        type,
        ageCategory: type === "children" ? ageCategory : undefined,
        size,
        description,
        rating,
        price: price ? Number(price) : undefined,
        status,
        images: files,
      });
      if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors;
        setFieldErrors(flat);
        setError(Object.values(flat).flat().join(" · "));
        return;
      }
      const result = await saveRegistryProduct(parsed.data);
      if (result.ok) {
        setOk("Product saved.");
        setName("");
        setSlug("");
        setType("male");
        setSize(CLOTHING_SIZES[0]);
        setAgeCategory("");
        setDescription("");
        setRating(null);
        setPrice("");
        setStatus("draft");
        setFiles([]);
        setPreviews([]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error saving product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p role="alert" className="rounded border border-red-700/50 bg-red-700/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p role="status" className="rounded border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-gold">
          {ok}
        </p>
      ) : null}

      <fieldset className="rounded-lg border border-white/15 bg-[#111111]/50 p-5">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">Product basics</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">
              Product name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Cotton Panjabi"
              className={INPUT}
            />
            {fieldError("name") && <p role="alert" className="text-xs text-red-700">{fieldError("name")}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">
              Slug
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              maxLength={100}
              placeholder="cotton-panjabi"
              className={INPUT}
            />
            {fieldError("slug") && <p role="alert" className="text-xs text-red-700">{fieldError("slug")}</p>}
          </div>
          <div className="space-y-2 col-span-2">
            <label className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">Type</label>
            <div className="flex gap-3">
              {(Object.entries(TYPE_LABELS) as [TypeValue, string][]).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-white/5",
                    type === value ? "border-gold bg-white/5" : "border-white/15",
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => onTypeChange(value)}
                    className="text-gold"
                  />
                  {label}
                </label>
              ))}
            </div>
            {fieldError("type") && <p role="alert" className="text-xs text-red-700">{fieldError("type")}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 bg-[#111111]/50 p-5">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">Size & age</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {type === "children" ? (
            <div className="space-y-2">
              <label className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">Age category</label>
              <select
                value={ageCategory}
                onChange={(e) => setAgeCategory(e.target.value)}
                className={INPUT}
              >
                <option disabled value="">Select age range</option>
                {AGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldError("ageCategory") && (
                <p role="alert" className="text-xs text-red-700">{fieldError("ageCategory")}</p>
              )}
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className={INPUT}>
              {allowedSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {fieldError("size") && <p role="alert" className="text-xs text-red-700">{fieldError("size")}</p>}
          </div>
        </div>
        <p className="mt-2 text-xs text-ash">
          {type === "others"
            ? "New arrivals use shoe sizes 36–46."
            : type === "children"
              ? "Children use clothing sizes S–XXXL with an age category."
              : "Men / adults use clothing sizes S–XXXL."}
        </p>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 bg-[#111111]/50 p-5">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">Details & review</legend>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">
              Product description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder="Fabric, fit, care, story…"
              className={INPUT}
            />
            {fieldError("description") && (
              <p role="alert" className="text-xs text-red-700">{fieldError("description")}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">Review rating</label>
            <div
              role="radiogroup"
              aria-label="Review rating (1-5 stars)"
              className="flex gap-1"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className="cursor-pointer group"
                  title={`${star} star${star === 1 ? "" : "s"}`}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={String(star)}
                    checked={rating === star}
                    onChange={() => setRating(star)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "text-2xl transition-colors",
                      star <= (rating ?? 0) ? "text-gold" : "text-white/20",
                      "hover:text-gold",
                    )}
                  >
                    ★
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-ash">Optional 5-star review rating.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 bg-[#111111]/50 p-5">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">Price & status</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="price" className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">
              Price (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ash">৳</span>
              <input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                required
                placeholder="0"
                className={`${INPUT} pl-10`}
              />
            </div>
            {fieldError("price") && <p role="alert" className="text-xs text-red-700">{fieldError("price")}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-[#F5F5F5]/80 uppercase tracking-wider">Status</label>
            <div className="flex gap-3">
              {(["draft", "published"] as StatusValue[]).map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-white/5",
                    status === value ? "border-gold bg-white/5" : "border-white/15",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="text-gold"
                  />
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-white/15 bg-[#111111]/50 p-5">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">
          Product images (max {MAX_IMAGES})
        </legend>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          className={cn(
            "flex flex-col items-center gap-3 rounded border-2 p-6 text-center transition-colors duration-200",
            isDragActive ? "border-gold bg-white/5" : "border-dashed border-white/15 hover:border-white/30",
          )}
        >
          <p className="text-sm text-[#F5F5F5]/80">
            {isDragActive ? "Drop images here" : "Drag & drop or click to select images"}
          </p>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            disabled={files.length >= 5}
            onChange={(e) => addFiles(e.target.files)}
            className="sr-only"
          />
          <label
            htmlFor="images"
            className={cn(
              "rounded bg-white/10 px-4 py-2 text-sm uppercase tracking-wider transition-colors",
              files.length >= 5 ? "opacity-50 cursor-not-allowed" : "text-gold hover:text-gold-dark cursor-pointer",
            )}
          >
            {files.length >= 5 ? "Limit reached (5)" : "Select images"}
          </label>
          <p className="text-xs text-ash">
            JPG / PNG / WebP &middot; max {MAX_IMAGES} per product &middot; previews below
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {previews.map((url, index) => (
            <li key={index} className="relative rounded border border-white/15 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- client-side preview of a locally selected file */}
              <img src={url} alt="" className="aspect-[4/5] w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-xs text-smoke hover:bg-gold text-black"
              >
                Remove
              </button>
              <p className="mt-1 text-xs text-ash truncate" title={files[index].name}>
                {files[index].name}
              </p>
            </li>
          ))}
        </ul>
        {files.length === 0 && <p className="mt-2 text-xs text-ash">No images yet.</p>}
      </fieldset>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-gold text-black px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving…" : "Save product"}
        </button>
        <Link
          href="/"
          className="rounded border border-white/15 px-6 py-3 text-sm font-medium uppercase tracking-wider text-[#F5F5F5] hover:text-gold transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
