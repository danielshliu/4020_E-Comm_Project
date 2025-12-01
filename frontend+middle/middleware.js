// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const userCookie = req.cookies.get("ddj-user");
  const isLoggedIn = !!userCookie;

  // Protect /add-item
  if (req.nextUrl.pathname.startsWith("/add-item") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/add-item/:path*"],
};
