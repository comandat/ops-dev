import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't need auth
    const isPublicRoute = 
        pathname === '/' || 
        pathname === '/login' || 
        pathname === '/register' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth');

    // Check for Lucia session cookie
    const allCookies = request.cookies.getAll().map(c => c.name);
    console.log(`Middleware Debug [${pathname}]: Cookies present:`, allCookies);
    const sessionCookie = request.cookies.get('auth_session');

    if (!sessionCookie && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access protected route
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionCookie && isPublicRoute) {
        // Redirect to dashboard if already authenticated and trying to access login/register
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!api|auth|_next/static|_next/image|favicon.ico).*)'],
};
