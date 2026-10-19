import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getRegistryProduct,
  restoreProduct,
  softDeleteProduct,
  updateRegistryProduct,
  type RegistryFormAction,
} from "@/app/registry/actions";
import { requireStaff } from "@/lib/auth";
import { formatBDT, cn } from "@/lib/format";
import { registryLogoutAction } from "@/app/registry/login/actions";
import ConfirmForm from "@/app/registry/confirm-form";
import { getRegistryDict } from "@/app/registry/registry-dict";
import { getRegistryLocale } from "@/app/registry/registry-locale";
import RegistryLanguageSwitch from "@/app/registry/registry-language-switch";

const STATUS_BADGE: Record<string, string> = {
  active: "reg-badge reg-badge-active",
  inactive: "reg-badge reg-badge-inactive",
  deleted: "reg-badge reg-badge-deleted",
};

export default async function RegistryProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const { id } = await params;
  // Resolve the real path first so an expired session returns here, not to a
  // literal "[id]" target.
  const session = await requireStaff(`/registry/products/${id}`);
  const locale = await getRegistryLocale();
  const t = getRegistryDict(locale);
  const product = await getRegistryProduct(id);
  if (!product) notFound();

  const isDeleted = product.status === "deleted";

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
              <button
                type="submit"
                className="reg-btn reg-btn-outline-light reg-btn-xs"
              >
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <Link
              href="/registry"
              className="text-xs text-ash hover:underline mb-1 block"
            >
              {t.backToRegistry}
            </Link>
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <p className="text-sm text-ash">
                {product.slug} · {product.createdAt.slice(0, 10)}
              </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/registry/products/new"
              className="reg-btn reg-btn-inverse"
            >
              + {t.addProduct}
            </Link>
            {isDeleted ? (
              <form action={restoreProduct as unknown as RegistryFormAction} className="flex-1">
                <input name="id" value={product.id} hidden />
                <button
                  type="submit"
                  className="reg-btn reg-btn-success-light"
                >
                  {t.restore}
                </button>
              </form>
            ) : (
              <ConfirmForm
                action={softDeleteProduct}
                message={t.deleteConfirm(product.name)}
                className="flex-1"
              >
                <input name="id" value={product.id} hidden />
                <button
                  type="submit"
                  className="reg-btn reg-btn-danger-light"
                >
                  {t.softDelete}
                </button>
              </ConfirmForm>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Gallery */}
          <div className="lg:col-span-1 space-y-2">
            {(product.images.length > 0 ? product.images : product.image ? [product.image] : [])
              .slice(0, 4)
              .map((src, i) => (
              <div
                key={i}
                className={cn(
                  "relative aspect-[3/4] rounded overflow-hidden border border-white/15 bg-black",
                  i === 0 ? "ring-2 ring-gold" : "hover:border-gold/50"
                )}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/25 text-[20px]">
                    {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Details + edit form */}
          <div className="lg:col-span-3 space-y-6">
            <section className="reg-panel">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ash">
                {t.details}
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="col-span-full flex items-center gap-3">
                  <span className="font-medium text-ash">{t.type}</span>
                  <span className={cn(STATUS_BADGE[product.status])}>
                    {(t.types as Record<string, string>)[product.type] ?? product.type}
                  </span>
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <span className="font-medium text-ash">{t.sizes}</span>
                  <span className="text-ash">{product.sizes.join(", ") || "—"}</span>
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <span className="font-medium text-ash">{t.priceShort}</span>
                  <span className="text-gold font-medium">{formatBDT(product.price)}</span>
                  {product.compareAt != null && product.compareAt > product.price && (
                    <span className="text-[12px] text-ash line-through">
                      {formatBDT(product.compareAt)}
                    </span>
                  )}
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <span className="font-medium text-ash">{t.status}</span>
                  <span
                    className={cn(STATUS_BADGE[product.status])}
                  >
                    {t.statuses[product.status as keyof typeof t.statuses] ??
                      product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                  {product.deletedAt && (
                    <span className="text-[11px] text-ash">· {t.statuses.deleted} {product.deletedAt.slice(0, 10)}</span>
                  )}
                </div>
                <div className="col-span-full flex items-center gap-3">
                  <span className="font-medium text-ash">{t.updated}</span>
                  <span className="text-ash">{product.updatedAt.slice(0, 10)}</span>
                </div>
              </dl>
            </section>

            <section className="reg-panel">
              <form action={updateRegistryProduct as unknown as RegistryFormAction} className="space-y-4">
                <input name="id" value={product.id} hidden />
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ash">
                  {t.editTitle}
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="col-span-full sm:col-span-2">
                    <label htmlFor="name" className="block mb-1.5 text-xs font-medium text-ash uppercase">
                      {t.name}
                    </label>
                    <input
                      id="name"
                      name="name"
                      defaultValue={product.name}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="section" className="block mb-1.5 text-xs font-medium text-ash uppercase">
                      {t.typeSection}
                    </label>
                    <select
                      id="section"
                      name="section"
                      defaultValue={product.type}
                      className="w-full"
                    >
                      <option value="men">{t.types.men}</option>
                      <option value="women">{t.types.women}</option>
                      <option value="kids">{t.types.kids}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price_paisa" className="block mb-1.5 text-xs font-medium text-ash uppercase">
                      {t.pricePaisa}
                    </label>
                    <input
                      id="price_paisa"
                      name="price_paisa"
                      defaultValue={String(product.price)}
                      type="number"
                      min="0"
                      required
                      inputMode="numeric"
                      className="w-full"
                    />
                  </div>
                  <div className="self-end">
                    <label className="flex items-center gap-2 text-xs font-medium text-ash uppercase">
                      <input
                        name="active"
                        type="checkbox"
                        defaultChecked={product.active}
                        className="rounded border-[#c9dcd8] bg-white text-gold focus:ring-gold"
                      />
                      {t.activeLabel}
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="reg-btn reg-btn-primary"
                  >
                    {t.saveChanges}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>

        {sp.saved === "1" && (
          <p className="mt-4 rounded border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {t.saved}
          </p>
        )}
      </div>
    </div>
  );
}
