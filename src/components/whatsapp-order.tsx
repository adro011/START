"use client";

import { SITE } from "@/config/site";

export default function WhatsAppOrder({ name, slug }: { name: string; slug: string }) {
  const text = encodeURIComponent(`Assalamu Alaikum! I want to order "${name}" (${slug}). Link: /product/${slug}`);
  const number = SITE.whatsappDigits;
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-green-700 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50"
    >
      <span aria-hidden>💬</span> Order via WhatsApp
    </a>
  );
}
