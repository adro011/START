import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import ContactForm from "@/components/contact-form";
import { page, rec, text } from "@/lib/content";

export const metadata: Metadata = {
  title: `Contact | ${SITE.name}`,
  description: `Contact ${SITE.name} — sizing help, orders and delivery across Bangladesh. Replies within 1–2 working days.`,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const p = page("contact");
  const form = rec(p.form);
  const formName = rec(form.name);
  const formEmail = rec(form.email);
  const formMessage = rec(form.message);
  const aside = rec(p.aside);
  const asideTrack = rec(aside.track);
  const initialStatus: "sent" | "error" | null = params.sent
    ? "sent"
    : params.error
      ? "error"
      : null;

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {text(p.title)}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">
          {text(p.intro)}
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ContactForm
            copy={{
              labels: {
                name: text(formName.label),
                email: text(formEmail.label),
                message: text(formMessage.label),
              },
              placeholders: {
                name: text(formName.placeholder),
                email: text(formEmail.placeholder),
                message: text(formMessage.placeholder),
              },
              submit: text(form.submit),
              sending: text(form.sending),
              success: text(form.success),
              error: text(form.error),
              networkError: text(form.networkError),
            }}
            initialStatus={initialStatus}
          />
          <aside className="space-y-4">
            <div className="bg-[var(--color-dark-iron)] p-6 text-[var(--color-smoke)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">{text(aside.direct)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{text(aside.email)}</p>
              <a href={`mailto:${SITE.email}`} className="font-medium text-gold underline underline-offset-4">{SITE.email}</a>
              <p className="mt-4 text-sm leading-relaxed text-steel">{text(aside.phone)}</p>
              <a href={`tel:${SITE.phone}`} className="font-medium text-gold underline underline-offset-4">{SITE.phone}</a>
              <p className="mt-4 text-sm text-steel">{text(aside.note)}</p>
            </div>
            <div className="border border-white/15 bg-[var(--color-dark-iron)] p-6 text-sm leading-relaxed text-steel">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-smoke)]">{text(asideTrack.title)}</h2>
              <p className="mt-2">{text(asideTrack.body)} <Link href="/track" className="text-gold underline underline-offset-4">tracking page</Link></p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
