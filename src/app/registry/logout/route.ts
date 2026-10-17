import { NextResponse, type NextRequest } from 'next/server';
import { REGISTRY_SESSION_COOKIE } from '@/lib/registry/session';

/**
 * Registry sign-out. Reachable while signed out (see middleware public paths)
 * so a stale cookie is always clearable; it only ever clears the session and
 * bounces back to the sign-in form.
 */
export function GET(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/registry/login';
  url.search = '';
  const response = NextResponse.redirect(url);
  response.cookies.delete(REGISTRY_SESSION_COOKIE);
  return response;
}
