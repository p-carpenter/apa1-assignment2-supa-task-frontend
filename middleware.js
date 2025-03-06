import { NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/profile',
  '/dashboard',
  // Add more protected paths as needed
];

// Paths that are only accessible to unauthenticated users
const authPaths = [
  '/login',
  '/signup',
  // Add more auth paths as needed
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected or auth-only
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // If it's not a protected or auth path, continue
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }
  
  // Get auth status from cookies
  const authCookie = request.cookies.get('sb-access-token');
  const isAuthenticated = !!authCookie;
  
  // Handle protected paths for unauthenticated users
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // Handle auth paths for authenticated users
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  // Continue for all other cases
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     * 4. All files in the public folder
     */
    '/((?!api|_next|static|.*\\..*|favicon.ico).*)',
  ],
};
