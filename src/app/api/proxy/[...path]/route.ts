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
  method: "GET" | "POST" | "PUT" | "DELETE",
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
  if (method === "POST" || method === "PUT") {
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

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body: method === "POST" || method === "PUT" ? body : undefined,
  });

  const outHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    outHeaders.set("content-type", contentType);
  }

  const buf = await upstream.arrayBuffer();

  // Invalidate marketplace fetch cache after service listing mutations.
  if (
    (method === "POST" || method === "PUT" || method === "DELETE") &&
    segments[0] === "services" &&
    upstream.ok
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

export async function DELETE(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, "DELETE", path ?? []);
}
