"use client";

import Link from "next/link";

/** Branded error boundary with a calm retry. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[13px] font-semibold tracking-[0.24em] text-gold uppercase">
        A loose thread
      </p>
      <h1
        className="mt-2 text-[52px] leading-tight font-medium text-[#F5F5F5]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Something snagged.
      </h1>
      <p className="mt-3 max-w-[44ch] text-[15.5px] text-steel">
        Give it another pass — usually that smooths it out. If it keeps
        happening, ping us on WhatsApp and we&apos;ll sort it.
      </p>
      {error.digest && (
        <p className="mt-2 text-[12px] text-ash">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-black uppercase hover:bg-gold-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-white/15 px-7 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-white/10 hover:text-[#F5F5F5]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
