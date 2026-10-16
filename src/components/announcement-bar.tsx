import { cookies } from "next/headers";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";

/**
 * Announcement bar — rotating house messages.
 * Server component: locale comes from the `locale` cookie (default en).
 * Desktop shows one calm centered line; mobile gets a CSS marquee.
 */
export async function AnnouncementBar() {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  const locale: Locale = raw === "bn" ? "bn" : "en";
  const d = getDict(locale);
  const messages = [d.announcement, d.announcement_2, d.announcement_3];

  return (
    <div
      role="region"
      aria-label="Announcements"
      className="bg-[#172121] text-[#FBF6F3]"
    >
      <p className="mx-auto hidden max-w-[1280px] truncate px-4 py-2 text-center text-[12.5px] font-medium tracking-[0.08em] uppercase md:block">
        {messages[0]}
      </p>
      <div className="overflow-hidden py-2 md:hidden" aria-hidden="false">
        <div className="announce-track flex w-max gap-12 pr-12 text-[12.5px] font-medium tracking-[0.08em] uppercase">
          {[...messages, ...messages].map((m, i) => (
            <span key={i} className="whitespace-nowrap">
              {m}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes announce-slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}.announce-track{animation:announce-slide 28s linear infinite}@media (prefers-reduced-motion: reduce){.announce-track{animation:none;transform:none}}`}</style>
    </div>
  );
}
