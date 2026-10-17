import Link from "next/link";
import Image from "next/image";
import {
  getRegistryProducts,
  softDeleteProduct,
  type RegistryFormAction,
  type RegistryProduct,
  type RegistryStatus,
} from "./actions";
import { requireStaff } from "@/lib/auth";
import { formatBDT, cn } from "@/lib/format";

const STATUS_LABEL: Record<RegistryStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  deleted: "Deleted",
};

const STATUS_BADGE: Record<RegistryStatus, string> = {
  active: "border-gold/30 bg-gold/5 text-gold",
  inactive: "border-white/15 bg-white/5 text-ash",
  deleted: "border-red-900/30 bg-red-900/5 text-red-400",
};

const SIZES = ["S", "M", "L", "XL"];

export default async function RegistryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireStaff("/registry");
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const type = sp.type ?? "";
  const size = sp.size ?? "";
  const status = sp.status ?? "";
  const page = Number.isFinite(Number(sp.page ?? 1)) ? Math.max(1, Number(sp.page)) : 1;
  const limit = Math.min(Math.max(1, Number(sp.limit ?? 50)), 50);

  const { products, hasNextPage } = await getRegistryProducts({ page, limit, q, type, size, status });

  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (type) base.set("type", type);
  if (size) base.set("size", size);
  if (status) base.set("status", status);
  const pageUrl = (p: number) => `/registry?${base.toString()}&page=${p}`;

  return (
    <div className="min-h-screen bg-black text-[#F5F5F5]">
      <header className="sticky top-0 z-20 border-b border-white/15 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-semibold text-gold tracking-tight">ABRAR</span>
            <span className="text-xs text-ash uppercase">registry</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs text-ash">
            <span>{session.user.email}{session.isDev ? " · dev" : ""}</span>
            <Link
              href="/registry/logout"
              className="rounded border border-white/15 px-2.5 py-1 hover:bg-white/10"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Registry products</h1>
            <p className="text-sm text-ash">
              {products.length} listed · soft-delete (deleted_at) · max {limit}/page
            </p>
          </div>
          <Link
            href="/registry/products/new"
            className="rounded bg-gold px-3 py-2 text-sm font-semibold text-black hover:bg-gold-dark"
          >
            + Add new product
          </Link>
        </div>

        <form method="get" className="flex flex-wrap gap-2 items-end mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or slug…"
            aria-label="Search products"
            className="min-w-52 flex-1 rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 text-sm"
          />
          <select
            name="type"
            defaultValue={type}
            aria-label="Filter by type"
            className="rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
          <select
            name="size"
            defaultValue={size}
            aria-label="Filter by size"
            className="rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 text-sm"
          >
            <option value="">All sizes</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            aria-label="Filter by status"
            className="rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>
          <button
            type="submit"
            className="rounded border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10"
          >
            Filter
          </button>
          {(q || type || size || status) && (
            <Link href="/registry" className="rounded border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10">
              Clear
            </Link>
          )}
        </form>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <RegistryCard key={p.id} product={p} deleteAction={softDeleteProduct as unknown as RegistryFormAction} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full rounded-lg border border-white/15 bg-[#111111] px-6 py-12 text-center">
              <p className="text-ash">No products match the current filters.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-ash">
            Page {page} {hasNextPage ? "· more results" : "· last page"}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1)}
                className="rounded border border-white/15 px-3 py-1.5 hover:bg-white/10"
              >
                ← Prev
              </Link>
            )}
            {hasNextPage && (
              <Link
                href={pageUrl(page + 1)}
                className="rounded border border-white/15 px-3 py-1.5 hover:bg-white/10"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RegistryCard({
  product,
  deleteAction,
}: {
  product: RegistryProduct;
  deleteAction: RegistryFormAction;
}) {
  const label = STATUS_LABEL[product.status];
  const badge = STATUS_BADGE[product.status];
  const size = product.sizes[0] ?? "—";

  return (
    <article className="rounded-lg border border-white/15 bg-[#181818] p-3 flex flex-col h-full">
      <div className="relative h-36 w-full rounded overflow-hidden bg-black mb-2">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={160}
            height={200}
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gold/30 text-[24px]">
            {product.type.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="absolute top-2 left-2 rounded border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-smoke">
          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="line-clamp-1 font-medium text-sm text-smoke">{product.name}</h3>
        <p className="flex items-center gap-1 text-[10px] text-ash">
          <span>{size}</span>{product.sizes.length > 1 && ` +${product.sizes.length - 1}`}
        </p>
        <p className="mt-auto font-medium text-gold">{formatBDT(product.price)}</p>
        <span
          className={cn(
            "inline-block rounded border px-2 py-0.5 text-[10px] font-semibold",
            badge
          )}
        >
          {label}
        </span>
      </div>
      <div className="mt-3 flex gap-1">
        <Link
          href={`/registry/products/${product.id}`}
          className="flex-1 rounded border border-white/15 px-2 py-1 text-[11px] font-semibold text-center text-smoke hover:bg-white/10"
        >
          Edit
        </Link>
        <form action={deleteAction as RegistryFormAction} onSubmit={() => window.confirm(`Soft delete “${product.name}"?`)} className="flex-1">
          <input name="id" value={product.id} hidden />
          <button
            type="submit"
            className="rounded border border-white/15 px-2 py-1 text-[11px] font-semibold text-center text-ash hover:bg-white/10"
          >
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}
