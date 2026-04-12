import { NextResponse } from "next/server";
import { clearAuthCookieOnResponse } from "@/lib/bff-cookies";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function POST(request: Request): Promise<NextResponse> {
  const backend = getServerBackendOrigin();
  const cookieHeader = request.headers.get("cookie") ?? "";

  await fetch(`${backend}/api/auth/logout`, {
    method: "POST",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });

  const out = NextResponse.json({ ok: true });
  clearAuthCookieOnResponse(out);
  return out;
}
