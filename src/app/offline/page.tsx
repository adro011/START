import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata = {
  title: `Offline — ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ letterSpacing: '0.2em', fontSize: '0.75rem', opacity: 0.7 }}>OFFLINE</p>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>You are offline</h1>
        <p style={{ opacity: 0.8, maxWidth: '34ch', margin: '0 auto 1.5rem' }}>
          Your connection dropped. Saved pages still work — please reconnect to shop and check out.
        </p>
        <Link href="/" style={{ textDecoration: 'underline' }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
