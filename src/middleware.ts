import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Safely decode JWT payload in Edge runtime */
function getJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    // 1. /admin/login is standalone & publicly accessible
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 2. Extract token from cookies
    const tokenCookie = request.cookies.get('token')?.value || request.cookies.get('jwt')?.value;

    // 3. Not authenticated -> Redirect to /admin/login
    if (!tokenCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Decode JWT payload
    const payload = getJwtPayload(tokenCookie);

    // 5. Authenticated but role !== ADMIN -> Redirect to homepage (hide route existence)
    if (!payload || payload.role !== 'ADMIN') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
