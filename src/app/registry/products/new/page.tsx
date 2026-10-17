import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import ProductForm from "./product-form";

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
      <div className="min-h-screen bg-black text-[#F5F5F5]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="mb-6 text-xs text-ash uppercase tracking-wider">
            <Link href="/" className="hover:underline">Home</Link> &middot; Shop registry
          </p>
          <h1
            className="mb-1"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2.25rem",
              fontWeight: 500,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            New product entry
          </h1>
          <p className="mb-8 text-sm text-ash">
            All fields are validated before the product is saved. Maximum 5 images per product.
          </p>
          <ProductForm />
        </div>
      </div>
    </>
  );
}
