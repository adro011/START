import { DEMO_SETTINGS } from '@/lib/admin-data';

async function settingsStub(formData: FormData): Promise<void> {
  'use server';
  // TODO: upsert site_settings(key, value jsonb) — admin only; revalidateTag('settings').
  // Value is parsed as JSON when possible, else stored as string.
  const key = String(formData.get('key') ?? '');
  const raw = String(formData.get('value') ?? '');
  let value: unknown = raw;
  try { value = JSON.parse(raw); } catch { /* keep string */ }
  console.log('settings save (stub) →', { key, value });
}

export default async function SettingsPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-ash">Edits site_settings key/values (stub → jsonb upsert).</p></div>
      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="bg-[#202020] text-xs uppercase tracking-wider text-ash"><th className="px-3 py-2">Key</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Notes</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {DEMO_SETTINGS.map((s) => (
              <tr key={s.key}>
                <td className="px-3 py-2 font-mono text-xs font-semibold">{s.key}</td>
                <td className="max-w-md truncate px-3 py-2 font-mono text-xs">{JSON.stringify(s.value)}</td>
                <td className="px-3 py-2 text-ash">{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={settingsStub} className="grid gap-3 rounded-lg border border-white/15 p-4 text-sm sm:grid-cols-3">
        <label className="block">Key<input name="key" required placeholder="announcement" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 font-mono" /></label>
        <label className="block sm:col-span-2">Value (JSON or text)<input name="value" required placeholder='{"men":"…"} or 6000' className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[#F5F5F5] placeholder:text-ash px-3 py-2 font-mono" /></label>
        <div className="sm:col-span-3"><button type="submit" className="rounded bg-gold px-4 py-2 font-medium text-black hover:bg-gold-dark">Save setting (stub)</button></div>
      </form>
    </div>
  );
}
