import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect /app/* routes
 * Redirects to /signin if no session cookie is present
 */
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('llama_session')?.value;

  // If no session token, redirect to signin
  if (!sessionToken) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Protect all routes under /app
export const config = {
  matcher: '/app/:path*',
};
