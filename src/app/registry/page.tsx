import Link from "next/link";
import Image from "next/image";
import {
  getRegistryProducts,
  softDeleteProduct,
  type RegistryProduct,
  type RegistryStatus,
} from "./actions";
import { requireStaff } from "@/lib/auth";
import { formatBDT, cn } from "@/lib/format";
import { registryLogoutAction } from "@/app/registry/login/actions";
import ConfirmForm from "./confirm-form";
import { getRegistryDict, type RegistryDict } from "./registry-dict";
import { getRegistryLocale } from "./registry-locale";
import RegistryLanguageSwitch from "./registry-language-switch";

const STATUS_BADGE: Record<RegistryStatus, string> = {
  active: "reg-badge-active",
  inactive: "reg-badge-inactive",
  deleted: "reg-badge-deleted",
};

const SIZES = ["S", "M", "L", "XL"];

export default async function RegistryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireStaff("/registry");
  const locale = await getRegistryLocale();
  const t = getRegistryDict(locale);
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
    <div className="min-h-screen">
      <header className="reg-header">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/registry" className="flex items-center gap-2">
            <span className="font-display font-semibold text-white tracking-tight">ABRAR</span>
            <span className="text-xs text-ash uppercase">{t.registry}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs text-ash">
            <RegistryLanguageSwitch />
            <span className="hidden sm:inline">
              {session.user.email}{session.isDev ? ` · ${t.dev}` : ""}
            </span>
            <form action={registryLogoutAction}>
              <button type="submit" className="reg-btn reg-btn-outline-light reg-btn-xs">
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.productsTitle}</h1>
            <p className="text-sm text-ash">{t.listedSummary(products.length, limit)}</p>
          </div>
          <Link href="/registry/products/new" className="reg-btn reg-btn-inverse">
            + {t.addProduct}
          </Link>
        </div>

        <form method="get" className="reg-toolbar flex flex-wrap gap-2 items-end mb-6">
          <div className="min-w-52 flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchAria}
              className="w-full"
            />
          </div>
          <select
            name="type"
            defaultValue={type}
            aria-label={t.typeAria}
            className="max-w-40"
          >
            <option value="">{t.allTypes}</option>
            <option value="men">{t.types.men}</option>
            <option value="women">{t.types.women}</option>
            <option value="kids">{t.types.kids}</option>
          </select>
          <select
            name="size"
            defaultValue={size}
            aria-label={t.sizeAria}
            className="max-w-32"
          >
            <option value="">{t.allSizes}</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status}
            aria-label={t.statusAria}
            className="max-w-40"
          >
            <option value="">{t.statusAll}</option>
            <option value="active">{t.statuses.active}</option>
            <option value="inactive">{t.statuses.inactive}</option>
            <option value="deleted">{t.statuses.deleted}</option>
          </select>
          <button type="submit" className="reg-btn reg-btn-primary">
            {t.filter}
          </button>
          {(q || type || size || status) && (
            <Link href="/registry" className="reg-btn reg-btn-ghost">
              {t.clear}
            </Link>
          )}
        </form>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <RegistryCard key={p.id} product={p} deleteAction={softDeleteProduct} t={t} />
          ))}
          {products.length === 0 && (
            <div className="reg-card col-span-full px-6 py-12 text-center">
              <p className="text-ash">{t.noResults}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-ash">
            {t.pageSummary(page, !hasNextPage)}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="reg-btn reg-btn-outline-light reg-btn-sm">
                {t.prev}
              </Link>
            )}
            {hasNextPage && (
              <Link href={pageUrl(page + 1)} className="reg-btn reg-btn-outline-light reg-btn-sm">
                {t.next}
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
  t,
}: {
  product: RegistryProduct;
  deleteAction: (formData: FormData) => unknown;
  t: RegistryDict;
}) {
  const label = t.statuses[product.status];
  const badge = STATUS_BADGE[product.status];
  const size = product.sizes[0] ?? "—";
  const typeLabel =
    (t.types as Record<string, string>)[product.type] ??
    product.type.charAt(0).toUpperCase() + product.type.slice(1);

  return (
    <article className="reg-card p-3 flex flex-col h-full">
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
          <div className="flex h-full items-center justify-center text-white/25 text-[24px]">
            {product.type.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="absolute top-2 left-2 rounded border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-smoke">
          {typeLabel}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <h2 className="line-clamp-1 font-medium text-sm text-[#0a2b28]">{product.name}</h2>
        <p className="flex items-center gap-1 text-[10px] text-ash">
          <span>{size}</span>{product.sizes.length > 1 && ` +${product.sizes.length - 1}`}
        </p>
        <p className="mt-auto font-medium text-gold">{formatBDT(product.price)}</p>
        <span
          className={cn("reg-badge", badge)}
        >
          {label}
        </span>
      </div>
      <div className="mt-3 flex gap-1">
        <Link
          href={`/registry/products/${product.id}`}
          className="reg-btn reg-btn-ghost reg-btn-xs flex-1 text-center"
        >
          {t.edit}
        </Link>
        <ConfirmForm
          action={deleteAction}
          message={t.deleteConfirm(product.name)}
          className="flex-1"
        >
          <input name="id" value={product.id} hidden />
          <button
            type="submit"
            className="reg-btn reg-btn-danger reg-btn-xs flex-1 text-center"
          >
            {t.delete}
          </button>
        </ConfirmForm>
      </div>
    </article>
  );
}
