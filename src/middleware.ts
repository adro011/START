import { NextResponse, type NextRequest } from 'next/server';
import { REGISTRY_SESSION_COOKIE, verifyRegistrySession } from '@/lib/registry/session';

// Edge gate for /admin and /registry (fail closed).
//
// Why here and not only in `admin/layout.tsx`: a `redirect()` thrown during
// the App Router server render can degrade into a client-render fallback that
// leaks the protected RSC payload with a 200 (observed: dashboard HTML served
// to logged-out curl). An edge redirect is a real HTTP 307 before any render,
// so it cannot be downgraded. The server layouts (`requireAdmin`/`requireStaff`)
// stay as the second layer.
//
// Rules:
// - `/registry/login` and `/registry/logout` are public (the sign-in form and
//   the cookie-clearing route must be reachable while signed out).
// - Signed registry session (`registry_session`, HMAC-SHA256 over a JSON
//   payload — see lib/registry/session.ts): role=admin reaches /admin and
//   /registry, role=staff reaches /registry only.
// - `demo_session` cookie with role=admin: honored only where demo login is
//   allowed (dev). Unsigned, so it never counts in production.
// - Any Supabase auth-token cookie → allowed through to /admin; the layout
//   verifies the role via RLS-backed `profiles` and rejects non-admins.
// - Everyone else → 307 to the matching sign-in (/registry/login or /login).
// /account/* is intentionally untouched (guest flows: tracking, guest
// checkout, demo wishlist).

const PUBLIC_REGISTRY_PATHS = new Set(['/registry/login', '/registry/logout']);

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

function redirectTo(request: NextRequest, pathname: string, search: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isRegistry = pathname === '/registry' || pathname.startsWith('/registry/');

  if (isRegistry && PUBLIC_REGISTRY_PATHS.has(pathname)) {
    const response = NextResponse.next();
    response.headers.set('x-path', pathname);
    return response;
  }

  if (isAdmin || isRegistry) {
    const registrySession = await verifyRegistrySession(
      request.cookies.get(REGISTRY_SESSION_COOKIE)?.value,
    );

    // Unsigned demo cookie is honored only where demo login is allowed
    // (mirrors demoLoginAllowed() in lib/auth.ts — keep the two in sync).
    const demoAllowed =
      process.env.ALLOW_DEMO_LOGIN === 'true' ||
      (process.env.ALLOW_DEMO_LOGIN !== 'false' && process.env.NODE_ENV !== 'production');
    const demoRole = demoAllowed ? readDemoRole(request) : null;

    // Registry admits staff and admins; the admin area is admins only.
    const registryRole = registrySession?.role ?? null;
    const allowed = isAdmin
      ? registryRole === 'admin' || demoRole === 'admin' || hasSupabaseSession(request)
      : registryRole === 'admin' ||
        registryRole === 'staff' ||
        demoRole === 'admin' ||
        demoRole === 'staff' ||
        hasSupabaseSession(request);

    if (!allowed) {
      const back = pathname + search;
      if (isAdmin) {
        const error = demoRole
          ? 'Shop registry is for staff — sign in with registry credentials.'
          : undefined;
        const search_ = error
          ? `?mode=admin&error=${encodeURIComponent(error)}&next=${encodeURIComponent(back)}`
          : `?next=${encodeURIComponent(back)}`;
        return redirectTo(request, '/login', search_);
      }
      return redirectTo(
        request,
        '/registry/login',
        `?next=${encodeURIComponent(back)}`,
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-path', pathname);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/registry/:path*', '/registry', '/account/:path*'],
};
