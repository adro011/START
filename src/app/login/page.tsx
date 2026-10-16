import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SITE } from '@/config/site';
import { createClient } from '@/lib/supabase/server';

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function magicLinkAction(formData: FormData): Promise<void> {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = String(formData.get('next') ?? '/admin');
  if (!email || !email.includes('@')) redirect('/login?error=invalid-email');
  const supabase = (await createClient()) as unknown as {
    auth: { signInWithOtp: (a: unknown) => Promise<{ error: { message: string } | null }> };
  } | null;
  if (!supabase) redirect('/login?error=not-configured');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/admin` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(`/login?sent=1&next=${encodeURIComponent(next)}`);
}

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const sp = (await searchParams) ?? {};
  const next = typeof sp.next === 'string' && sp.next.startsWith('/') ? sp.next : '/admin';
  const sent = sp.sent === '1';
  const error = sp.error;
  const brand = (SITE as unknown as { name?: string })?.name ?? 'brand-store';

  if (!configured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{brand} · Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Demo mode — Supabase is not configured.</p>
          <p className="mt-1">Set NEXT_PUBLIC_SUPABASE_URL + keys to enable magic-link sign-in. Meanwhile the dev session is auto admin.</p>
        </div>
        <Link href={next} className="mt-6 inline-flex items-center justify-center rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          Continue to {next} →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{brand} · Admin</p>
      <h1 className="mt-2 text-3xl font-semibold">Sign in with magic link</h1>
      <p className="mt-2 text-sm text-stone-600">We email you a one-time sign-in link. No password needed.</p>
      {sent ? (
        <div className="mt-6 rounded border border-green-300 bg-green-50 p-4 text-sm text-green-900">
          Check your inbox — link sent. It expires in ~1 hour.
        </div>
      ) : null}
      {error ? <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-900">{decodeURIComponent(error)}</div> : null}
      <form action={magicLinkAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="text-sm font-medium">Work email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@brand.com" className="mt-1 w-full rounded border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900" />
        </label>
        <button type="submit" className="w-full rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700">
          Send magic link
        </button>
      </form>
      <p className="mt-4 text-xs text-stone-500">Staff/admin roles are assigned via profiles.role. First admin: sign up, then run the promote SQL from plan §13.</p>
    </main>
  );
}
