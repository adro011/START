import { NextResponse, type NextRequest } from 'next/server';

// Edge gate for /admin (fail closed).
//
// Why here and not only in `admin/layout.tsx`: a `redirect()` thrown during
// the App Router server render can degrade into a client-render fallback that
// leaks the protected RSC payload with a 200 (observed: dashboard HTML served
// to logged-out curl). An edge redirect is a real HTTP 307 before any render,
// so it cannot be downgraded. The server layout (`requireAdmin`) stays as the
// second layer — it additionally verifies the Supabase role via RLS-backed
// `profiles`, which the edge cannot do safely.
//
// Rules:
// - `demo_session` cookie with role=admin (shop-registry login) → allow.
// - Any Supabase auth-token cookie → allow through; the layout verifies the
//   role and rejects non-admins (demo customer cookies do NOT pass: they have
//   no sb cookie and role != admin, so they land on the registry form).
// - Everyone else → 307 to /login (bottom-left "Shop registry · Admin log in"
//   entry point lives there).
// /account/* is intentionally untouched (guest flows: tracking, guest
// checkout, demo wishlist).

function readDemoRole(request: NextRequest): string | null {
  try {
    const raw = request.cookies.get('demo_session')?.value;
    if (!raw) return null;
    // Same contract as lib/auth.ts: a session needs user AND role.
    const parsed = JSON.parse(decodeURIComponent(raw)) as { user?: unknown; role?: unknown };
    if (typeof parsed?.user !== 'string' || !parsed.user) return null;
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Unsigned demo cookie is honored only where demo login is allowed
    // (mirrors demoLoginAllowed() in lib/auth.ts — keep the two in sync).
    const demoAllowed =
      process.env.ALLOW_DEMO_LOGIN === 'true' ||
      (process.env.ALLOW_DEMO_LOGIN !== 'false' && process.env.NODE_ENV !== 'production');
    const role = demoAllowed ? readDemoRole(request) : null;
    if (role !== 'admin' && !hasSupabaseSession(request)) {
      const login = request.nextUrl.clone();
      login.pathname = '/login';
      const back = pathname + search;
      login.search = role
        ? `?mode=admin&error=${encodeURIComponent('Shop registry is for staff — sign in with registry credentials.')}&next=${encodeURIComponent(back)}`
        : `?next=${encodeURIComponent(back)}`;
      return NextResponse.redirect(login);
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-path', pathname);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
