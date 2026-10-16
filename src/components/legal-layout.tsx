import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type LegalLayoutProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  updated?: string;
  /** Template-not-legal-advice note (rendered by default if omitted). */
  disclaimer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function LegalLayout({
  eyebrow,
  title,
  intro,
  updated,
  disclaimer,
  children,
  className,
}: LegalLayoutProps) {
  return (
    <main className={cn("bg-[#FBF6F3] text-[#172121]", className)}>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">
        <header>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D451B]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-4 text-lg leading-relaxed text-[#172121]/80">
              {intro}
            </p>
          ) : null}
          <div
            aria-hidden="true"
            className="my-8 h-px w-full bg-[#172121]/10"
          />
          {updated ? (
            <p className="text-sm text-[#172121]/80">Last updated: {updated}</p>
          ) : null}
        </header>
        <div className="mt-8 space-y-6 text-[1.02rem] leading-relaxed text-[#172121]/90 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[#172121] [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_a]:text-clay [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_table]:w-full [&_th]:bg-[#172121] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-[#FBF6F3] [&_td]:border-b [&_td]:border-[#172121]/10 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm">
          {children}
        </div>
        <footer className="mt-12 rounded-none border border-[#7E9181]/40 bg-[#F2CCC3]/40 px-5 py-4 text-sm leading-relaxed text-[#172121]/80">
          {disclaimer ?? (
            <p>
              <strong className="font-semibold">Please note:</strong> this page
              is a template for a Bangladeshi online store — not legal advice.
              Please have a local lawyer review it before launch.
            </p>
          )}
        </footer>
      </article>
    </main>
  );
}
