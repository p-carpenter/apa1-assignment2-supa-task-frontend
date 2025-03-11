import { NextResponse } from "next/server";

// Paths that require authentication
const protectedPaths = ["/profile"];

// Paths that are only accessible to unauthenticated users
const authPaths = ["/login", "/signup"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("sb-access-token");
  const isAuthenticated = !!authCookie;

  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // redirect to homepage if user signs out
  if (pathname === "/logout") {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
    "/((?!api|_next|static|.*\\..*|favicon.ico).*)",
  ],
};
