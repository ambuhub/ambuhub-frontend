import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedProxySegments } from "@/lib/api-proxy-allowlist";
import { MARKETPLACE_SERVICES_CACHE_TAG } from "@/lib/cache-tags";
import { getServerBackendOrigin } from "@/lib/server-backend-origin";

type RouteParams = { params: Promise<{ path: string[] }> };

function buildUpstreamUrl(
  backend: string,
  segments: string[],
  search: string,
): string {
  const path = segments.map((s) => encodeURIComponent(s)).join("/");
  const base = `${backend}/api/${path}`;
  return search ? `${base}?${search}` : base;
}

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  segments: string[],
): Promise<NextResponse> {
  if (!isAllowedProxySegments(segments)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const backend = getServerBackendOrigin();
  const url = new URL(request.url);
  const upstreamUrl = buildUpstreamUrl(backend, segments, url.searchParams.toString());

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }
  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }

  let body: BodyInit | undefined;
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    if (contentType?.toLowerCase().includes("multipart/form-data")) {
      body = await request.arrayBuffer();
    } else {
      body = await request.text();
    }
  }

  // Without this guard an unreachable backend rejects the route handler, and
  // Next answers with an HTML error page. Every caller here does res.json(),
  // so that surfaces as the opaque "Unexpected token '<'" parse error rather
  // than something a user or developer can act on.
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body:
        method === "POST" || method === "PUT" || method === "PATCH"
          ? body
          : undefined,
    });
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the API at ${backend}. Is the backend running?` },
      { status: 502 },
    );
  }

  const outHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    outHeaders.set("content-type", contentType);
  }

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204, headers: outHeaders });
  }

  const buf = await upstream.arrayBuffer();

  // Invalidate marketplace fetch cache after service listing mutations or checkout (stock).
  const isPaystackCheckoutMutation =
    segments[0] === "orders" &&
    method === "POST" &&
    ((segments[1] === "paystack" && segments[2] === "verify") ||
      (segments[2] === "paystack" &&
        segments[3] === "initialize" &&
        (segments[1] === "checkout" ||
          segments[1] === "hire-checkout" ||
          segments[1] === "book-checkout")));
  if (
    upstream.ok &&
    (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") &&
    (segments[0] === "services" || isPaystackCheckoutMutation)
  ) {
    revalidateTag(MARKETPLACE_SERVICES_CACHE_TAG, "max");
  }

  return new NextResponse(buf, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "GET", path ?? []);
}

export async function POST(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "POST", path ?? []);
}

export async function PUT(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "PUT", path ?? []);
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "PATCH", path ?? []);
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "DELETE", path ?? []);
}
