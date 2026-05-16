const ALLOWED_ROOTS = new Set([
  "cart",
  "country-codes",
  "orders",
  "receipts",
  "reviews",
  "notifications",
  "service-categories",
  "services",
  "uploads",
  "wallet",
]);

export function isAllowedProxySegments(segments: string[]): boolean {
  if (segments.length === 0) {
    return false;
  }
  return ALLOWED_ROOTS.has(segments[0] ?? "");
}
