import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  // Block ALL DELETE requests unless the user is ADMIN.
  // This protects every API DELETE endpoint globally.
  if (req.method === "DELETE") {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Delete permission denied. Only an administrator can delete records.",
        },
        { status: 403 }
      );
    }
  }

  // Admin area
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // Advocate area
  if (pathname.startsWith("/advocate")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (role !== "ADMIN" && role !== "ADVOCATE") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  // Staff area
  if (pathname.startsWith("/staff")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/advocate/:path*",
    "/staff/:path*",
    "/api/:path*",
  ],
};