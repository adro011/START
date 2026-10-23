"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { saveRegistryProduct } from "./actions";
import { cn } from "@/lib/format";
import type { Locale } from "@/lib/dictionary";
import { getRegistryDict } from "@/app/registry/registry-dict";

const MAX_IMAGES = 5;

const MEN_SIZES: readonly string[] = ["S", "M", "L", "XL", "XXL", "XXXL"];
const WOMEN_SIZES: readonly string[] = Array.from({ length: 13 }, (_, i) => String(36 + i)); // 36..48
const BOY_SIZES: readonly string[] = ["S", "M", "L", "XL", "XXL", "XXXL"];
const GIRL_ALPHA_SIZES: readonly string[] = ["S", "M", "L", "XL", "XXL"];
const GIRL_NUMERIC_SIZES: readonly string[] = Array.from({ length: 13 }, (_, i) => String(36 + i)); // 36..48
const CHILDREN_AGE_SIZES: readonly string[] = Array.from({ length: 13 }, (_, i) => String(36 + i)); // 36..48 (optional)

const CHILD_GENDER_CATEGORIES: readonly string[] = ["Boys", "Girls"];
const CHILD_AGE_RANGES: readonly string[] = [
  "(1-2)", "(3-4)", "(5-6)", "(7-8)", "(9-10)", "(11-12)", "(13-14)", "(15-16)", "(17-18)",
];
const SIZE_SYSTEMS: readonly SizeSystem[] = ["alpha", "numeric"];
const NEW_ARRIVAL_AUDIENCES: readonly NewArrivalAudience[] = ["men", "women", "children"];

type ChildGender = "Boys" | "Girls";
type TypeValue = "men" | "women" | "children" | "new-arrivals";
type StatusValue = "draft" | "published";
type SizeSystem = "alpha" | "numeric";
type NewArrivalAudience = "men" | "women" | "children";

type SizeOptions = {
  childGender?: ChildGender;
  newArrivalAudience?: NewArrivalAudience;
  sizeSystem?: SizeSystem;
};

function isChildContext(type: TypeValue, newArrivalAudience?: NewArrivalAudience): boolean {
  return type === "children" || (type === "new-arrivals" && newArrivalAudience === "children");
}

function childSizes(childGender?: ChildGender, sizeSystem?: SizeSystem): readonly string[] {
  if (childGender === "Boys") return BOY_SIZES;
  if (childGender === "Girls") {
    return sizeSystem === "numeric" ? GIRL_NUMERIC_SIZES : GIRL_ALPHA_SIZES;
  }
  return CHILDREN_AGE_SIZES; // age-only fallback
}

function sizesForType(type: TypeValue, options: SizeOptions = {}): readonly string[] {
  switch (type) {
    case "men":
      return MEN_SIZES;
    case "women":
      return WOMEN_SIZES;
    case "children":
      return childSizes(options.childGender, options.sizeSystem);
    case "new-arrivals":
      if (options.newArrivalAudience === "women") return WOMEN_SIZES;
      if (options.newArrivalAudience === "children") {
        return childSizes(options.childGender, options.sizeSystem);
      }
      return MEN_SIZES; // men / unset default
  }
}

const INPUT = "w-full";

export const registryFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  slug: z.string().trim().min(2, "Slug is required.").max(100).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  type: z.enum(["men", "women", "children", "new-arrivals"] as [string, ...string[]]),
  ageCategory: z.enum([...CHILD_GENDER_CATEGORIES, ...CHILD_AGE_RANGES] as [string, ...string[]]).optional(),
  childGender: z.enum(CHILD_GENDER_CATEGORIES as [string, ...string[]]).optional(),
  newArrivalAudience: z.enum(NEW_ARRIVAL_AUDIENCES as [string, ...string[]]).optional(),
  sizeSystem: z.enum(SIZE_SYSTEMS as [string, ...string[]]).optional(),
  size: z.string(),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than 0."),
  status: z.enum(["draft", "published"] as [string, ...string[]]),
  images: z.array(z.instanceof(File)).max(MAX_IMAGES, `Maximum ${MAX_IMAGES} images per product.`),
})
  .refine((data) => data.type !== "new-arrivals" || !!data.newArrivalAudience, {
    message: "Choose who this new arrival is for.",
    path: ["newArrivalAudience"],
  })
  .refine((data) => {
    const type = data.type as TypeValue;
    const audience = data.newArrivalAudience as NewArrivalAudience | undefined;
    return !isChildContext(type, audience) || !!data.ageCategory;
  }, {
    message: "Age category is required for children.",
    path: ["ageCategory"],
  })
  .refine((data) => {
    const type = data.type as TypeValue;
    const audience = data.newArrivalAudience as NewArrivalAudience | undefined;
    return !isChildContext(type, audience) || data.size.length > 0;
  }, {
    message: "Size is required.",
    path: ["size"],
  })
  .refine((data) => {
    const type = data.type as TypeValue;
    const audience = data.newArrivalAudience as NewArrivalAudience | undefined;
    const childGender = data.childGender as ChildGender | undefined;
    const sizeSystem = data.sizeSystem as SizeSystem | undefined;
    const allowed = sizesForType(type, {
      childGender,
      newArrivalAudience: audience,
      sizeSystem,
    });
    return allowed.includes(data.size);
  }, {
    message: "Choose a valid size for this type.",
    path: ["size"],
  });

export default function ProductForm({ locale }: { locale: Locale }) {
  const t = getRegistryDict(locale);
  const typeLabels: Record<TypeValue, string> = {
    men: t.types.men,
    women: t.types.women,
    children: t.types.children,
    "new-arrivals": t.types["new-arrivals"],
  };
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<TypeValue>("men");
  const [ageCategory, setAgeCategory] = useState("");
  const [childGender, setChildGender] = useState<ChildGender | "">("Boys");
  const [newArrivalAudience, setNewArrivalAudience] = useState<NewArrivalAudience>("men");
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>("alpha");
  const [size, setSize] = useState(sizesForType("men")[0]);
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

  const isChild = isChildContext(type, newArrivalAudience);
  const allowedSizes = sizesForType(type, {
    childGender: childGender || undefined,
    newArrivalAudience,
    sizeSystem,
  });

  function onTypeChange(value: TypeValue) {
    setType(value);
    setNewArrivalAudience("men");
    setSizeSystem("alpha");
    setSize(sizesForType(value, { newArrivalAudience: "men" })[0]);
    setAgeCategory("");
    setChildGender("Boys" as ChildGender);
    setFieldErrors({});
  }

  function onNewArrivalAudienceChange(value: NewArrivalAudience) {
    setNewArrivalAudience(value);
    setAgeCategory("");
    setSize(sizesForType("new-arrivals", {
      newArrivalAudience: value,
      childGender: childGender || undefined,
      sizeSystem,
    })[0]);
    setFieldErrors({});
  }

  function onChildGenderChange(gender: ChildGender) {
    setChildGender(gender);
    setSizeSystem("alpha");
    setSize(childSizes(gender, "alpha")[0]);
    setAgeCategory("");
    setFieldErrors({});
  }

  function onSizeSystemChange(value: SizeSystem) {
    setSizeSystem(value);
    setSize(childSizes(childGender || undefined, value)[0]);
    setFieldErrors({});
  }

  function onAgeCategoryChange(value: string) {
    setAgeCategory(value);
    setFieldErrors({});
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    if (files.length + fileList.length > MAX_IMAGES) {
      setError(t.imageLimit);
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
        ageCategory: isChild ? ageCategory : undefined,
        childGender: isChild ? (childGender as ChildGender | undefined) : undefined,
        newArrivalAudience: type === "new-arrivals" ? newArrivalAudience : undefined,
        sizeSystem: isChild && childGender === "Girls" ? sizeSystem : undefined,
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
        setOk(t.productSaved);
        setName("");
        setSlug("");
        setType("men");
        setChildGender("Boys" as ChildGender);
        setNewArrivalAudience("men");
        setSizeSystem("alpha");
        setSize(sizesForType("men")[0]);
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
        <p role="alert" className="rounded border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p role="status" className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          {ok}
        </p>
      ) : null}

      <fieldset className="reg-panel">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">{t.basics}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs text-ash tracking-wider">
              {t.productName}
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder={t.productNamePlaceholder}
              className={INPUT}
            />
            {fieldError("name") && <p role="alert" className="reg-input-error">{fieldError("name")}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-xs text-ash tracking-wider">
              {t.slug}
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              maxLength={100}
              placeholder={t.slugPlaceholder}
              className={INPUT}
            />
            {fieldError("slug") && <p role="alert" className="reg-input-error">{fieldError("slug")}</p>}
          </div>
          <div className="space-y-2 col-span-2">
            <label className="block text-xs text-ash tracking-wider" id="type-group-label">{t.type}</label>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="type-group-label">
              {(Object.entries(typeLabels) as [TypeValue, string][]).map(([value, label]) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-[#f2f7f6]",
                    type === value ? "border-gold bg-[#eaf4f2]" : "border-[color:var(--reg-line)]",
                  )}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => onTypeChange(value as TypeValue)}
                    className="text-gold"
                  />
                  {label}
                </label>
              ))}
            </div>
            {fieldError("type") && <p role="alert" className="reg-input-error">{fieldError("type")}</p>}
          </div>
          {type === "new-arrivals" ? (
            <div className="space-y-2 col-span-2">
              <label className="block text-xs text-ash tracking-wider" id="new-arrival-audience-label">
                {t.newArrivalAudience}
              </label>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="new-arrival-audience-label">
                {NEW_ARRIVAL_AUDIENCES.map((audience) => (
                  <label
                    key={audience}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-[#f2f7f6]",
                      newArrivalAudience === audience ? "border-gold bg-[#eaf4f2]" : "border-[color:var(--reg-line)]",
                    )}
                  >
                    <input
                      type="radio"
                      name="newArrivalAudience"
                      value={audience}
                      checked={newArrivalAudience === audience}
                      onChange={() => onNewArrivalAudienceChange(audience)}
                      className="text-gold"
                    />
                    {t.types[audience]}
                  </label>
                ))}
              </div>
              {fieldError("newArrivalAudience") && (
                <p role="alert" className="reg-input-error">{fieldError("newArrivalAudience")}</p>
              )}
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="reg-panel">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">{t.sizeAge}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {isChild ? (
            <div className="space-y-2">
              <label className="block text-xs text-ash tracking-wider">{t.childGender}</label>
              <div className="flex flex-wrap gap-3" role="radiogroup">
                {CHILD_GENDER_CATEGORIES.map((gender) => (
                  <label
                    key={gender}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-[#f2f7f6]",
                      childGender === gender ? "border-gold bg-[#eaf4f2]" : "border-[color:var(--reg-line)]",
                    )}
                  >
                    <input
                      type="radio"
                      name="childGender"
                      value={gender}
                      checked={childGender === gender}
                      onChange={() => onChildGenderChange(gender as ChildGender)}
                      className="text-gold"
                    />
                    {gender}
                  </label>
                ))}
              </div>
              {childGender === "Girls" ? (
                <>
                  <label className="block text-xs text-ash tracking-wider" id="size-system-label">
                    {t.sizeSystem}
                  </label>
                  <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="size-system-label">
                    {SIZE_SYSTEMS.map((system) => (
                      <label
                        key={system}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-[#f2f7f6]",
                          sizeSystem === system ? "border-gold bg-[#eaf4f2]" : "border-[color:var(--reg-line)]",
                        )}
                      >
                        <input
                          type="radio"
                          name="sizeSystem"
                          value={system}
                          checked={sizeSystem === system}
                          onChange={() => onSizeSystemChange(system)}
                          className="text-gold"
                        />
                        {system === "alpha" ? t.sizeSystemAlpha : t.sizeSystemNumeric}
                      </label>
                    ))}
                  </div>
                </>
              ) : null}
              <label htmlFor="ageCategory" className="block text-xs text-ash tracking-wider">{t.ageCategory}</label>
              <select
                id="ageCategory"
                value={ageCategory}
                onChange={(e) => onAgeCategoryChange(e.target.value)}
                className={INPUT}
              >
                <option disabled value="">{t.selectAge}</option>
                {CHILD_AGE_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              {fieldError("ageCategory") && (
                <p role="alert" className="reg-input-error">{fieldError("ageCategory")}</p>
              )}
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="size" className="block text-xs text-ash tracking-wider">{t.size}</label>
            <select id="size" value={size} onChange={(e) => setSize(e.target.value)} className={INPUT}>
              {allowedSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {fieldError("size") && <p role="alert" className="reg-input-error">{fieldError("size")}</p>}
          </div>
        </div>
        <p className="mt-2 text-xs text-ash">
          {type === "men" || (type === "new-arrivals" && newArrivalAudience === "men")
            ? t.hintMen
            : type === "women" || (type === "new-arrivals" && newArrivalAudience === "women")
              ? t.hintWomen
              : childGender === "Boys"
                ? t.hintBoys
                : childGender === "Girls"
                  ? t.hintGirls
                  : t.hintChildrenAge}
        </p>
      </fieldset>

      <fieldset className="reg-panel">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">{t.detailsReview}</legend>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="description" className="block text-xs text-ash tracking-wider">
              {t.productDescription}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              placeholder={t.descriptionPlaceholder}
              className={INPUT}
            />
            {fieldError("description") && (
              <p role="alert" className="reg-input-error">{fieldError("description")}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-ash tracking-wider">{t.rating}</label>
            <div
              role="radiogroup"
              aria-label={t.ratingAria}
              className="flex gap-1"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  className="cursor-pointer group"
                  title={t.ratingStar(star)}
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
                      star <= (rating ?? 0) ? "text-gold" : "text-[#6b8582]",
                      "hover:text-gold",
                    )}
                  >
                    ★
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-ash">{t.ratingHint}</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="reg-panel">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">{t.priceStatus}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="price" className="block text-xs text-ash tracking-wider">
              {t.price}
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
            {fieldError("price") && <p role="alert" className="reg-input-error">{fieldError("price")}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-ash tracking-wider" id="status-group-label">{t.status}</label>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="status-group-label">
              {(["draft", "published"] as StatusValue[]).map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded border px-3 py-2 text-sm hover:bg-[#f2f7f6]",
                    status === value ? "border-gold bg-[#eaf4f2]" : "border-[color:var(--reg-line)]",
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
                  {t.statusOptions[value]}
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="reg-panel">
        <legend className="px-2 text-xs font-semibold text-gold uppercase tracking-wider">
          {t.imagesTitle}
        </legend>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          className={cn(
            "flex flex-col items-center gap-3 rounded border-2 p-6 text-center transition-colors duration-200",
            isDragActive ? "border-gold bg-[#eaf4f2]" : "border-dashed border-[color:var(--reg-line)] hover:border-[#4f6f6b]",
          )}
        >
          <p className="text-sm text-ash">
            {isDragActive ? t.dropActive : t.dropIdle}
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
              "rounded bg-[#eaf4f2] px-4 py-2 text-sm uppercase tracking-wider transition-colors",
              files.length >= 5 ? "opacity-50 cursor-not-allowed" : "text-gold hover:text-[#0a4741] cursor-pointer",
            )}
          >
            {files.length >= 5 ? t.limitReached : t.selectImages}
          </label>
          <p className="text-xs text-ash">
            {t.imageHint}
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {previews.map((url, index) => (
            <li key={index} className="relative rounded border border-[color:var(--reg-line)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- client-side preview of a locally selected file */}
              <img src={url} alt="" className="aspect-[4/5] w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 reg-btn reg-btn-danger reg-btn-xs"
              >
                {t.remove}
              </button>
              <p className="mt-1 text-xs text-ash truncate" title={files[index].name}>
                {files[index].name}
              </p>
            </li>
          ))}
        </ul>
        {files.length === 0 && <p className="mt-2 text-xs text-ash">{t.noImages}</p>}
      </fieldset>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="reg-btn reg-btn-inverse disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? t.saving : t.saveProduct}
        </button>
        <Link
          href="/"
          className="reg-btn reg-btn-outline-light"
        >
          {t.cancel}
        </Link>
      </div>
    </form>
  );
}
