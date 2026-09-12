import { NextResponse } from 'next/server';

/**
 * Middleware for protecting routes
 * Redirects unauthenticated users to sign-in page
 */
export function middleware() {
    // const token = req.cookies.get('auth_token')?.value;
    // const path = req.nextUrl.pathname;

    // Protected routes that require authentication
    // const protectedRoutes = ['/profile', '/dashboard', '/management'];
    // const protectedRoutes = ['/compare', '/profile', '/dashboard', '/management'];
    // const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    // Helper: check if JWT is expired
    // function isJwtExpired(token: string | undefined): boolean {
    //     if (!token) return true;
    //     try {
    //         const payload = token.split('.')[1];
    //         if (!payload) return true;
    //         const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    //         if (!decoded.exp) return false;
    //         const now = Math.floor(Date.now() / 1000);
    //         return decoded.exp < now;
    //     } catch {
    //         return true;
    //     }
    // }

    // If user is not authenticated or token is expired and trying to access protected route
    // if ((isJwtExpired(token) || !token) && isProtectedRoute) {
    //     const signInUrl = new URL('/auth/signin', req.url);
    //     signInUrl.searchParams.set('callbackUrl', path);
    //     return NextResponse.redirect(signInUrl);
    // }

    return NextResponse.next();
}

/**
 * Configure which routes require authentication
 */
export const config = {
    // matcher: [
    //     // '/compare/:path*',
    //     '/profile/:path*',
    //     '/dashboard/:path*',
    //     '/management/:path*',
    // ],
};
