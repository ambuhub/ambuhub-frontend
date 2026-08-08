import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

function redirectToAuth(request: NextRequest, isAdminRoute: boolean) {
  return NextResponse.redirect(
    new URL(isAdminRoute ? "/admin/login" : "/auth", request.url),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProvider = pathname.startsWith("/provider");
  const isClient = pathname.startsWith("/client");
  const isAdmin = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set; protected app routes are blocked");
    return redirectToAuth(request, isAdmin);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isAdminLogin) {
    if (!token) {
      return NextResponse.next();
    }
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );
      const role = typeof payload.role === "string" ? payload.role : "";
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } catch {
      // Invalid session — allow the login page.
    }
    return NextResponse.next();
  }

  if (!token) {
    return redirectToAuth(request, isAdmin);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const role = typeof payload.role === "string" ? payload.role : "";

    if (isAdmin) {
      if (role === "admin") {
        return NextResponse.next();
      }
      if (role === "service_provider") {
        return NextResponse.redirect(
          new URL("/provider/dashboard", request.url),
        );
      }
      if (role === "client" || role === "patient") {
        return NextResponse.redirect(
          new URL("/client/dashboard", request.url),
        );
      }
      return redirectToAuth(request, true);
    }

    if (isProvider) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (role === "service_provider") {
        return NextResponse.next();
      }
      if (role === "client" || role === "patient") {
        return NextResponse.redirect(
          new URL("/client/dashboard", request.url),
        );
      }
      return redirectToAuth(request, false);
    }

    if (isClient) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (role === "client" || role === "patient") {
        return NextResponse.next();
      }
      if (role === "service_provider") {
        return NextResponse.redirect(
          new URL("/provider/dashboard", request.url),
        );
      }
      return redirectToAuth(request, false);
    }
  } catch {
    return redirectToAuth(request, isAdmin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/provider/:path*", "/client/:path*", "/admin/:path*"],
};
