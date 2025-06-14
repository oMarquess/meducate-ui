import { NextRequest } from 'next/server';

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

export function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/test-cors',
  ];

  return publicPaths.some(path => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  });
} 