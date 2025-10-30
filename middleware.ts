import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize trailing slash (ensure route match works for e.g. /login/)
  const normalizedPath =
    pathname.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  const isPublicRoute = publicRoutes.includes(normalizedPath);

  // Get the token from cookies
  const token = request.cookies.get('access_token')?.value;

  // Allow all _next/static, _next/image, api, and favicon.ico through without redirect/auth checks
  if (
    pathname.startsWith('_next/static') ||
    pathname.startsWith('_next/image') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access a public route, redirect to dashboard
  if (token && isPublicRoute) {
    // Don't redirect if coming from password reset success
    const referer = request.headers.get('referer');
    // If the referrer is from a password reset flow, allow access
    if (referer && referer.includes('/forgot-password')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
