import { DEMO_COUPONS } from '@/lib/admin-data';

async function couponStub(formData: FormData): Promise<void> {
  'use server';
  // TODO: upsert into coupons table (admin only), then revalidateTag('coupons').
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  console.log('coupon save (stub) →', code, Object.fromEntries(formData.entries()));
}

export default async function CouponsPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Coupons</h1><p className="text-sm text-ash">Demo stub → coupons table (percent / fixed / free_shipping)</p></div>
      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="bg-[#202020] text-xs uppercase tracking-wider text-ash"><th className="px-3 py-2">Code</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Min subtotal</th><th className="px-3 py-2">Used</th><th className="px-3 py-2">Active</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {DEMO_COUPONS.map((c) => (
              <tr key={c.code}>
                <td className="px-3 py-2 font-mono font-semibold">{c.code}</td>
                <td className="px-3 py-2">{c.type}</td>
                <td className="px-3 py-2">{c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? `${c.value} paisa` : '—'}</td>
                <td className="px-3 py-2">{c.minSubtotalPaisa}</td>
                <td className="px-3 py-2">{c.usedCount}/{c.usageLimit}</td>
                <td className="px-3 py-2">{c.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={couponStub} className="grid gap-3 rounded-lg border border-white/15 p-4 text-sm sm:grid-cols-4">
        <label className="block">Code<input name="code" required placeholder="EID15" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 uppercase" /></label>
        <label className="block">Type<select name="type" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2"><option value="percent">percent</option><option value="fixed">fixed</option><option value="free_shipping">free_shipping</option></select></label>
        <label className="block">Value<input name="value" inputMode="numeric" placeholder="10 or paisa" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2" /></label>
        <label className="block">Min subtotal (paisa)<input name="min" inputMode="numeric" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2" /></label>
        <div className="sm:col-span-4"><button type="submit" className="rounded bg-gold px-4 py-2 font-medium text-black hover:bg-gold-dark">Save coupon (stub)</button></div>
      </form>
    </div>
  );
}
