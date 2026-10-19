import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import ProductForm from "./product-form";
import { getRegistryDict } from "@/app/registry/registry-dict";
import { getRegistryLocale } from "@/app/registry/registry-locale";
import RegistryLanguageSwitch from "@/app/registry/registry-language-switch";

export const metadata: Metadata = {
  title: "New product — Shop registry · ABRAR",
  description: "Create a new product entry in the ABRAR shop registry.",
};

export default async function NewRegistryProductPage() {
  // Protected route — registry staff (admin / staff) required.
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/login?mode=admin&next=" + encodeURIComponent("/registry/products/new"));
  }
  const locale = await getRegistryLocale();
  const t = getRegistryDict(locale);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- deliberate: <link> fonts keep builds offline-safe (see DECISIONS.md) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-xs text-ash uppercase tracking-wider">
              <Link href="/" className="hover:underline">{t.home}</Link> &middot; {t.shopRegistry}
            </p>
            <RegistryLanguageSwitch />
          </div>
          <h1 className="mb-1">{t.newTitle}</h1>
          <p className="mb-8 text-sm text-ash">
            {t.newBlurb}
          </p>
          <ProductForm locale={locale} />
        </div>
      </div>
    </>
  );
}
