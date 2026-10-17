import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/** Demo credentials (storefront demo — no email required). */
export const DEMO_ADMIN_USERNAME = process.env.DEMO_ADMIN_USERNAME ?? 'aa.adro.09';
export const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? 'Ceyx4noir@';
if (process.env.NODE_ENV === 'production' && (!process.env.DEMO_ADMIN_USERNAME || !process.env.DEMO_ADMIN_PASSWORD)) {
  throw new Error('DEMO_ADMIN_USERNAME and DEMO_ADMIN_PASSWORD required in production');
}
const DEMO_COOKIE = 'demo_session';

export interface SessionUser {
  id: string;
  email: string;
}

export type Role = 'admin' | 'staff' | 'customer';

export interface Session {
  user: SessionUser;
  role: Role;
  isDev: boolean;
}

const DEV_SESSION: Session = {
  user: { id: 'dev', email: 'dev@example.com' },
  role: 'admin',
  isDev: true,
};

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export interface DemoSessionValue {
  user: string;
  role: Role;
  provider?: string;
}

export function readDemoSession(cookieHeader?: string): Session | null {
  try {
    let raw: string | undefined;
    if (typeof cookieHeader === 'string') {
      const m = cookieHeader.match(/(?:^|;\s*)demo_session=([^;]+)/);
      raw = m?.[1];
    }
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw)) as DemoSessionValue;
    if (!parsed?.user || !parsed?.role) return null;
    if (parsed.role !== 'admin' && parsed.role !== 'staff' && parsed.role !== 'customer') return null;
    return {
      user: { id: `demo:${parsed.user}`, email: parsed.user.includes('@') ? parsed.user : `${parsed.user}@demo.local` },
      role: parsed.role,
      isDev: true,
    };
  } catch {
    return null;
  }
}

async function readDemoSessionFromStore(): Promise<Session | null> {
  try {
    const store = await cookies();
    const raw = store.get(DEMO_COOKIE)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw)) as DemoSessionValue;
    if (!parsed?.user || !parsed?.role) return null;
    if (parsed.role !== 'admin' && parsed.role !== 'staff' && parsed.role !== 'customer') return null;
    return {
      user: { id: `demo:${parsed.user}`, email: parsed.user.includes('@') ? parsed.user : `${parsed.user}@demo.local` },
      role: parsed.role,
      isDev: true,
    };
  } catch {
    return null;
  }
}

/** Demo-cookie auth is a local/dev convenience. In production it is
 *  disabled unless explicitly enabled — the cookie is unsigned JSON and
 *  must never be a privilege source on a live store. */
function demoLoginAllowed(): boolean {
  if (process.env.ALLOW_DEMO_LOGIN === 'true') return true;
  if (process.env.ALLOW_DEMO_LOGIN === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export async function getSession(): Promise<Session | null> {
  // 0. Demo cookie session (dev only unless ALLOW_DEMO_LOGIN=true —
  //    unsigned cookie, never trust it in production by default).
  if (demoLoginAllowed()) {
    const demo = await readDemoSessionFromStore();
    if (demo) return demo;
  }
  // Dev fallback: no Supabase env → treat as logged-in admin so /admin is usable locally.
  // Fail closed in production: missing env must mean unauthenticated, never admin.
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === 'production') return null;
    return DEV_SESSION;
  }
  try {
    // createClient() is async + null-safe by contract — null means unauthenticated.
    const supabase = (await createClient()) as unknown as {
      auth: { getUser: () => Promise<{ data: { user: { id: string; email?: string | null } | null }; error: unknown }> };
      from: (t: string) => {
        select: (c: string) => {
          eq: (col: string, v: string) => { single: () => Promise<{ data: { role?: string } | null }> };
        };
      };
    } | null;
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    let role: Role = 'customer';
    try {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'admin' || profile?.role === 'staff') role = profile.role;
    } catch {
      // keep default role
    }
    return { user: { id: data.user.id, email: data.user.email ?? '' }, role, isDev: false };
  } catch {
    return null;
  }
}

export async function requireAdmin(next = '/admin'): Promise<Session> {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (s.role !== 'admin') throw new Error('Forbidden: admin only');
  return s;
}

export async function requireStaff(next = '/admin'): Promise<Session> {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (s.role !== 'admin' && s.role !== 'staff') throw new Error('Forbidden: staff only');
  return s;
}
