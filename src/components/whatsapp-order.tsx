"use client";

import { SITE } from "@/config/site";

/**
 * Full-width secondary order channel — WhatsApp is a first-class
 * checkout path in Bangladesh, so it sits directly under the buy box.
 */
export default function WhatsAppOrder({ name, slug }: { name: string; slug: string }) {
  const text = encodeURIComponent(`Assalamu Alaikum! I want to order "${name}" (${slug}). Link: /product/${slug}`);
  const number = SITE.whatsappDigits;
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 border border-[#172121]/25 px-4 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase transition-colors hover:border-green-700 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5573B]"
    >
      <span aria-hidden="true">💬</span> Order via WhatsApp
    </a>
  );
}
