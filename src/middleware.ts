import { NextResponse, type NextRequest } from 'next/server';

// Permissive by design: this middleware only tags the request with x-path for
// logging/observability and lets it continue. Real enforcement happens in
// server layouts via requireAdmin()/requireStaff() (Supabase server client +
// dev fallback), because:
// 1. Edge middleware cannot safely validate the httpOnly Supabase session /
//    role without duplicating auth logic and risking redirect loops.
// 2. Dev mode has no session cookie at all (dev admin fallback in lib/auth.ts),
//    so blocking here would lock out local development.
// 3. /account/* shares the same pattern — layout-level gates give better errors.

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set('x-path', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
