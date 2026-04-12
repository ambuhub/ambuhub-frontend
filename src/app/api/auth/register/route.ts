import { NextResponse } from "next/server";
import {
  applyAuthCookieToResponse,
  collectSetCookieLines,
  extractAuthTokenFromSetCookieLines,
} from "@/lib/bff-cookies";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getServerBackendOrigin();
  const upstream = await fetch(`${backend}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json(
      { message: "Upstream returned invalid JSON" },
      { status: 502 },
    );
  }

  const out = NextResponse.json(payload, { status: upstream.status });

  if (!upstream.ok) {
    return out;
  }

  const token = extractAuthTokenFromSetCookieLines(
    collectSetCookieLines(upstream),
  );
  if (!token) {
    return NextResponse.json(
      { message: "Registration succeeded but session cookie was not returned" },
      { status: 502 },
    );
  }

  applyAuthCookieToResponse(out, token);
  return out;
}
