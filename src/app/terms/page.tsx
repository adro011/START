import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";
import { page, rec, text } from "@/lib/content";
import ContentBlocks from "@/components/content-blocks";

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE.name}`,
  description: `Terms for shopping at ${SITE.name} — orders, payments, delivery, exchanges and acceptable use.`,
};

export default function TermsPage() {
  const p = page("terms");
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
