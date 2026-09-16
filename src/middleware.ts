import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only enforce authentication for Advocate pages.
  if (path.startsWith("/advocate")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    const allowedRoles = ["ADVOCATE", "ADMIN"];
    const role = token?.role as string | undefined;

    if (!token || !role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/advocate/:path*",
    "/api/cases/:path*",
    "/api/hearings/:path*",
    "/api/documents/:path*",
  ],
};