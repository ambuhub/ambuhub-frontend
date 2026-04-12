/** Server-side and non-BFF callers (e.g. ISR) — full backend origin. */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";
  return raw.replace(/\/$/, "");
}

/** Same-origin BFF for browser `fetch(..., { credentials: "include" })`. */
export const API_AUTH_BFF_PREFIX = "/api/auth";

/** Same-origin allowlisted proxy to Express `/api/*`. */
export const API_PROXY_PREFIX = "/api/proxy";
