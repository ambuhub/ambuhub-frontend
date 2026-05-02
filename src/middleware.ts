import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProvider = pathname.startsWith("/provider");
  const isClient = pathname.startsWith("/client");

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set; protected app routes are blocked");
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const role = typeof payload.role === "string" ? payload.role : "";

    if (isProvider) {
      if (role === "service_provider") {
        return NextResponse.next();
      }
      if (role === "client" || role === "patient") {
        return NextResponse.redirect(
          new URL("/client/dashboard", request.url),
        );
      }
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (isClient) {
      if (role === "client" || role === "patient") {
        return NextResponse.next();
      }
      if (role === "service_provider") {
        return NextResponse.redirect(
          new URL("/provider/dashboard", request.url),
        );
      }
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/provider/:path*", "/client/:path*"],
};
