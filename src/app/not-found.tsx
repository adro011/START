import Link from "next/link";

/** Branded 404 — warm, short, and pointed back to shopping. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-[13px] font-semibold tracking-[0.24em] text-[#D5573B] uppercase">
        404 · Off the rack
      </p>
      <h1
        className="mt-2 text-[52px] leading-tight font-medium text-[#172121]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        This piece isn&apos;t on the rail.
      </h1>
      <p className="mt-3 max-w-[44ch] text-[15.5px] text-[#172121]/65">
        The page moved, sold out, or never existed. The good stuff is still
        here — let&apos;s get you back to it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-[#172121] px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-[#FBF6F3] uppercase hover:bg-[#D5573B]"
        >
          Home
        </Link>
        <Link
          href="/new-arrivals"
          className="border border-[#172121] px-7 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-[#172121] hover:text-[#FBF6F3]"
        >
          New arrivals
        </Link>
        <Link
          href="/sale"
          className="border border-[#D5573B] px-7 py-3 text-[12px] font-semibold tracking-[0.16em] text-[#D5573B] uppercase hover:bg-[#D5573B] hover:text-white"
        >
          Sale
        </Link>
      </div>
    </div>
  );
}
