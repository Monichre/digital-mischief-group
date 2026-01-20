import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/api/enrich",
  "/api/brand-recon",
  "/api/scouts",
  "/api/monitors",
  "/api/research",
  "/api/stripe/checkout",
  "/enrich",
  "/brand-recon",
  "/scouts",
  "/observe",
  "/research",
  "/field-report",
  "/burn-logs",
  "/settings",
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Check if route is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Lightweight auth check in Edge: look for Better Auth session cookie
  const hasSession = !!getSessionCookie(request);

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !hasSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from auth routes to home/dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (Better Auth routes)
     * - api/webhooks (webhook endpoints need to be accessible)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/webhooks).*)",
  ],
};

