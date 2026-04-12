import type { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const SEVEN_DAYS_SEC = 60 * 60 * 24 * 7;

export function authCookieOptions(): {
  httpOnly: boolean;
  path: string;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
} {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SEVEN_DAYS_SEC,
  };
}

/**
 * Parse JWT from Express Set-Cookie lines (ambuhub_access_token=...).
 */
export function extractAuthTokenFromSetCookieLines(
  lines: string[],
): string | null {
  const prefix = `${AUTH_COOKIE_NAME}=`;
  for (const line of lines) {
    if (!line.startsWith(prefix)) {
      continue;
    }
    const firstPart = line.split(";")[0] ?? "";
    const value = firstPart.slice(prefix.length);
    if (value.length > 0) {
      return value;
    }
  }
  return null;
}

export function collectSetCookieLines(res: Response): string[] {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  if (!single) {
    return [];
  }
  return single.split(/,(?=[^;]+?=)/).map((s) => s.trim());
}

export function applyAuthCookieToResponse(
  res: NextResponse,
  token: string,
): void {
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
}

export function clearAuthCookieOnResponse(res: NextResponse): void {
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    ...authCookieOptions(),
    maxAge: 0,
  });
}
