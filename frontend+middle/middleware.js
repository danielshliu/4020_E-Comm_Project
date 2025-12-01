// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
   console.log('Middleware triggered for:', req.nextUrl.pathname);

  const userCookie = req.cookies.get("ddj-user");
  const isLoggedIn = !!userCookie;

  //okay so our middleware isnt even doing its job correctly cuz u didnt add
  //THE PROXY TO THE BACKEND
  //jacob thats why it wasnt working cuz the proxy wasnt working

  if(req.nextUrl.pathname.startsWith("/api/")){
    const backendUrl = `http://localhost:3001${req.nextUrl.pathname}${req.nextUrl.search}`;
  
    return NextResponse.rewrite (new URL(backendUrl));
  }

  // Protect /add-item
  if (req.nextUrl.pathname.startsWith("/add-item") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*","/add-item/:path*"],
};
