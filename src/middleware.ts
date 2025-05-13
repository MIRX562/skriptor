import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Define route groups
const publicRoutes = ["/", "/sign-in", "/sign-up"];
const authRoutes = ["/sign-in", "/sign-up"];
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // If route is protected and no session, redirect to sign-in
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !sessionCookie
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If route is auth (sign-in/up) and session exists, redirect to dashboard
  if (authRoutes.some((route) => pathname.startsWith(route)) && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes are always accessible
  return NextResponse.next();
}

export const config = {
  matcher: [publicRoutes, authRoutes, protectedRoutes],
};
