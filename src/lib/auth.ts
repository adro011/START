import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

export async function getSession(): Promise<Session | null> {
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
