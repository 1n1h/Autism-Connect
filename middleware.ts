import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/blog/create",
  "/messages",
];

const AUTH_PAGES = ["/login", "/signup"];

const ADMIN_PUBLIC = ["/admin/login", "/admin/setup", "/admin/accept-invite"];
const ADMIN_COOKIE = "ac_admin_token";
const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------- Admin routes ----------
  if (pathname.startsWith("/admin")) {
    const isPublic = ADMIN_PUBLIC.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (isPublic) return NextResponse.next();

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!token || !secret) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, encoder.encode(secret));
      return NextResponse.next();
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      const res = NextResponse.redirect(url);
      res.cookies.delete(ADMIN_COOKIE);
      return res;
    }
  }

  // ---------- User routes ----------
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
