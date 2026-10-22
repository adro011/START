import Link from 'next/link';
import { DEMO_CATEGORIES } from '@/lib/admin-data';

async function categoryStub(formData: FormData): Promise<void> {
  'use server';
  // TODO: insert/update categories row (slug unique, section men|women|kids), revalidateTag('categories').
  console.log('category save (stub) →', Object.fromEntries(formData.entries()));
}

export default async function CategoriesPage() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-semibold">Categories</h1><p className="text-sm text-ash">Seed tree lives in Supabase migration (plan §6) — this table is the demo stub.</p></div>
      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead><tr className="bg-[var(--color-charcoal)] text-xs uppercase tracking-wider text-ash"><th className="px-3 py-2">Name</th><th className="px-3 py-2">Slug</th><th className="px-3 py-2">Section</th><th className="px-3 py-2">Link</th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {DEMO_CATEGORIES.map((c) => (
              <tr key={c.slug}>
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{c.slug}</td>
                <td className="px-3 py-2">{c.section}</td>
                <td className="px-3 py-2"><Link href={`/${c.section}/${c.slug}`} className="text-xs hover:underline">/{c.section}/{c.slug}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={categoryStub} className="grid gap-3 rounded-lg border border-white/15 p-4 text-sm sm:grid-cols-4">
        <label className="block">Name<input name="name" required className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
        <label className="block">Slug<input name="slug" required pattern="[a-z0-9-]+" className="textInput mt-1 w-full bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2" /></label>
        <label className="block">Section<select name="section" className="mt-1 w-full rounded border border-white/15 bg-[#111111] text-[var(--color-smoke)] placeholder:text-ash px-3 py-2"><option value="men">men</option><option value="women">women</option><option value="kids">kids</option></select></label>
        <div className="flex items-end"><button type="submit" className="rounded bg-gold px-4 py-2 font-medium text-black hover:bg-gold-dark">Save (stub)</button></div>
      </form>
    </div>
  );
}
