import { NextResponse, type NextRequest } from 'next/server';

// Minimal middleware: forward locale via header for all routes.
// Admin/registry auth is handled in layouts (server components).

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const locale = request.cookies.get('locale')?.value === 'bn' ? 'bn' : 'en';

  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*|_error).*)'],
};