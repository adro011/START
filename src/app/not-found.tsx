import Link from "next/link";

/** Branded 404 — warm, short, and pointed back to shopping. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[13px] font-semibold tracking-[0.24em] text-gold uppercase">
        404 · Off the rack
      </p>
      <h1
        className="mt-2 text-[52px] leading-tight font-medium text-[#F5F5F5]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        This piece isn&apos;t on the rail.
      </h1>
      <p className="mt-3 max-w-[44ch] text-[15.5px] text-steel">
        The page moved, sold out, or never existed. The good stuff is still
        here — let&apos;s get you back to it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-black uppercase hover:bg-gold-dark"
        >
          Home
        </Link>
        <Link
          href="/new-arrivals"
          className="border border-white/15 px-7 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-white/10 hover:text-[#F5F5F5]"
        >
          New arrivals
        </Link>
        <Link
          href="/sale"
          className="border border-gold px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-gold uppercase hover:bg-gold hover:text-black"
        >
          Sale
        </Link>
      </div>
    </div>
  );
}
