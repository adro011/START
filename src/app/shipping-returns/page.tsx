import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";
import { page, rec, text } from "@/lib/content";
import ContentBlocks from "@/components/content-blocks";

export const metadata: Metadata = {
  title: `Shipping & Returns | ${SITE.name}`,
  description: `Delivery across Bangladesh (COD available), charges, timelines and 7-day size exchange at ${SITE.name}.`,
};

export default function ShippingReturnsPage() {
  const p = page("shipping-returns");
  return (
    <LegalLayout
      eyebrow={text(p.eyebrow)}
      title={text(p.title)}
      intro={text(p.intro)}
      updated={text(p.updated)}
    >
      <ContentBlocks blocks={rec(p.block)} />
    </LegalLayout>
  );
}
