import { NextResponse } from "next/server";
import {
  applyAuthCookieToResponse,
  collectSetCookieLines,
  extractAuthTokenFromSetCookieLines,
} from "@/lib/bff-cookies";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function GET(request: Request): Promise<NextResponse> {
  const backend = getServerBackendOrigin();
  const cookie = request.headers.get("cookie");
  const upstream = await fetch(`${backend}/api/auth/verify-email`, {
    method: "GET",
    headers: cookie ? { cookie } : {},
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

  return NextResponse.json(payload, { status: upstream.status });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getServerBackendOrigin();
  const cookie = request.headers.get("cookie");
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/api/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      {
        message: `Cannot reach API at ${backend}. Is the backend running?`,
      },
      { status: 502 },
    );
  }

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
  if (token) {
    applyAuthCookieToResponse(out, token);
  }
  return out;
}
