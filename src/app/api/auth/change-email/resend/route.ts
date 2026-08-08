import { NextResponse } from "next/server";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function POST(request: Request): Promise<NextResponse> {
  const backend = getServerBackendOrigin();
  const cookie = request.headers.get("cookie");
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/api/auth/change-email/resend`, {
      method: "POST",
      headers: cookie ? { cookie } : {},
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

  return NextResponse.json(payload, { status: upstream.status });
}
