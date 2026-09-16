import { auth } from "@/auth"; // Or import from "@/lib/auth" depending on where your auth instance is exported
import { NextResponse } from "next/server";

export default auth((req) => {
  const token = req.auth;
  const path = req.nextUrl.pathname;

  // Advocate Routes Protection
  if (path.startsWith("/advocate")) {
    const allowedRoles = ["ADVOCATE", "ADMIN"];
    
    if (!token?.user || !allowedRoles.includes(token.user.role as string)) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/advocate/:path*",
    "/api/cases/:path*",
    "/api/hearings/:path*",
    "/api/documents/:path*",
  ],
};