/** Branded home skeleton — gold‑pulse, no layout shift. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-4">
      <div className="flex min-h-[78vh] flex-col gap-3 md:flex-row">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="min-h-[320px] flex-1 animate-pulse bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)]/20 md:min-h-0"
          />
        ))}
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
        <div className="mb-8 h-10 w-64 animate-pulse bg-[var(--color-gold)]/10" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[240px] shrink-0">
              <div className="aspect-[3/4] animate-pulse bg-[var(--color-gold)]/10" />
              <div className="mt-3 h-4 w-3/4 animate-pulse bg-[var(--color-gold)]/10" />
              <div className="mt-2 h-4 w-1/3 animate-pulse bg-[var(--color-gold)]/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
