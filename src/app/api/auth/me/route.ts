import { NextResponse } from "next/server";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function GET(request: Request): Promise<NextResponse> {
  const backend = getServerBackendOrigin();
  const cookie = request.headers.get("cookie");
  const upstream = await fetch(`${backend}/api/auth/me`, {
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
