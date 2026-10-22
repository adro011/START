import type { Metadata } from "next";
import LegalLayout from "@/components/legal-layout";
import { SITE } from "@/config/site";
import { page, rec, text } from "@/lib/content";
import ContentBlocks from "@/components/content-blocks";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE.name}`,
  description: `How ${SITE.name} collects, uses and protects your personal data — orders, accounts and marketing in Bangladesh.`,
};

export default function PrivacyPage() {
  const p = page("privacy");

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
