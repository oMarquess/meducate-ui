import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromRequest, isPublicPath } from '@/lib/auth-middleware';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // For protected routes, check for auth token
  const token = getTokenFromRequest(request);
  
  // If no token, redirect to sign-in
  if (!token) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow access if token exists (token validation is handled by the API)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
