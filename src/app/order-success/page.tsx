import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const orderRaw = raw.order;
  const order = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-4xl" aria-hidden>🎉</p>
      <h1 className="mt-2 text-2xl font-semibold">Shukriya! Order placed.</h1>
      {order ? (
        <p className="mt-2 text-sm">
          Order no: <span className="font-mono font-semibold">{order}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-ash">No order number in URL — did you refresh?</p>
      )}
      <p className="mt-2 text-sm text-ash">
        We’ll call to confirm, then dispatch in 24–48h. Track anytime with your order no + phone.
      </p>
      <div className="mt-6 flex justify-center gap-3 text-sm">
        <Link href="/track" className="rounded-full bg-gold px-5 py-2.5 font-medium text-black hover:bg-gold-dark">Track order</Link>
        <Link href="/" className="rounded-full border px-5 py-2.5">Continue shopping</Link>
      </div>
    </main>
  );
}
