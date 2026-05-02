import { NextResponse } from "next/server";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const backend = getServerBackendOrigin();
  const upstream = await fetch(`${backend}/api/auth/forgot-password`, {
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

  return NextResponse.json(payload, { status: upstream.status });
}
