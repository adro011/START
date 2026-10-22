const ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="9" r="5" />
        <path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5" />
      </svg>
    ),
    title: "Hand-finished craft",
    copy: "Woven in Bangladesh",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth={1.7} />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={1.7} />
      </svg>
    ),
    title: "COD nationwide",
    copy: "Pay at your door",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="17" r="1.6" />
        <circle cx="17" cy="17" r="1.6" />
      </svg>
    ),
    title: "Fast delivery",
    copy: "Dhaka 2–3 days",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M4 9V6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M4 9h16M4 9v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
        <path d="M9 13h6" />
      </svg>
    ),
    title: "7-day exchange",
    copy: "No-drama swaps",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M12 3v18M7 7.5c0-1.5 2-3 5-3s5 1.5 5 3-2 2.5-5 3-5 1.5-5 3 2 3 5 3 5-1.5 5-3" />
      </svg>
    ),
    title: "Honest pricing",
    copy: "No fake markdowns",
  },
];

/**
 * Dark assurance card under the buy box: craft, COD, delivery, exchange,
 * pricing. Static server component — no client JS.
 */
export default function TrustPanel() {
  return (
    <section
      aria-label="Why shop with us"
      className="relative overflow-hidden bg-[var(--color-dark-iron)] px-5 py-6 text-[var(--color-smoke)] sm:px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 h-48 w-64 rounded-full bg-white/5 blur-[80px]"
      />
      <ul className="relative grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
        {ITEMS.slice(0, 3).map((t) => (
          <li key={t.title} className="flex flex-col items-start gap-1.5">
            <span className="text-steel">{t.icon}</span>
            <p className="text-[13.5px] leading-snug font-semibold">{t.title}</p>
            <p className="text-[12px] leading-snug text-ash">{t.copy}</p>
          </li>
        ))}
      </ul>
      <ul className="relative mt-5 grid grid-cols-2 gap-x-4 border-t border-white/15 pt-5">
        {ITEMS.slice(3).map((t) => (
          <li key={t.title} className="flex flex-col items-start gap-1.5">
            <span className="text-steel">{t.icon}</span>
            <p className="text-[13.5px] leading-snug font-semibold">{t.title}</p>
            <p className="text-[12px] leading-snug text-ash">{t.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
