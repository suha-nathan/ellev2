import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  // protected routes
  const protectedRoutes = ["/dashboard", "/learning-plans/new"];

  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));

  if (isProtected && !isAuth) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/learning-plans/new"],
};
