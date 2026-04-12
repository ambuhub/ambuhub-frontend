/**
 * Backend base URL for Next Route Handlers only (server).
 * Prefer API_ORIGIN so the real API URL is not required to be NEXT_PUBLIC.
 */
export function getServerBackendOrigin(): string {
  const raw =
    process.env.API_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:3002";
  return raw.replace(/\/$/, "");
}
