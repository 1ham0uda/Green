import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection at the edge layer.
 *
 * Firebase client-side JWTs cannot be verified here without the Admin SDK
 * (which requires a server runtime, not the edge runtime). Instead we use a
 * lightweight session cookie strategy:
 *
 *  - On successful sign-in the app sets a `__session` cookie (httpOnly, sameSite=strict).
 *  - Middleware checks for the presence of that cookie on protected routes.
 *  - The actual auth state is still enforced by Firestore security rules and
 *    the AdminGate / AuthGate components, so a spoofed cookie never grants
 *    data access — it only prevents the blank-page flash before hydration.
 *
 * Protected route groups:
 *   /admin/*     → requires session + role=admin  (cookie: __session_role=admin)
 *   /vendor/*    → requires session
 *   /checkout    → requires session
 *   /orders      → requires session
 *   /cart        → requires session
 *   /saved       → requires session
 *   /notifications → requires session
 *   /settings/*  → requires session
 *   /posts/new   → requires session
 *   /plants/new  → requires session
 *   /stories/new → requires session
 *   /groups/new  → requires session
 */

const SESSION_COOKIE = "__session";
const ROLE_COOKIE = "__session_role";

const AUTH_REQUIRED = [
  "/vendor",
  "/checkout",
  "/orders",
  "/cart",
  "/saved",
  "/notifications",
  "/settings",
  "/posts/new",
  "/plants/new",
  "/stories/new",
  "/groups/new",
];

const ADMIN_REQUIRED = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const sessionRole = request.cookies.get(ROLE_COOKIE)?.value;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (ADMIN_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!hasSession || sessionRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = hasSession ? "/" : "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Auth-required routes ──────────────────────────────────────────────────
  if (AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/checkout",
    "/orders",
    "/cart",
    "/saved",
    "/notifications",
    "/settings/:path*",
    "/posts/new",
    "/plants/new",
    "/stories/new",
    "/groups/new",
  ],
};
