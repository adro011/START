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
      <p className="text-[13px] font-semibold tracking-[0.24em] text-clay uppercase">
        A loose thread
      </p>
      <h1
        className="mt-2 text-[52px] leading-tight font-medium text-[#172121]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Something snagged.
      </h1>
      <p className="mt-3 max-w-[44ch] text-[15.5px] text-[#172121]/65">
        Give it another pass — usually that smooths it out. If it keeps
        happening, ping us on WhatsApp and we&apos;ll sort it.
      </p>
      {error.digest && (
        <p className="mt-2 text-[12px] text-[#172121]/40">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-clay px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#7D451B]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-[#172121] px-7 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-[#172121] hover:text-[#FBF6F3]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
