const ALLOWED_ROOTS = new Set([
  "service-categories",
  "services",
  "uploads",
]);

export function isAllowedProxySegments(segments: string[]): boolean {
  if (segments.length === 0) {
    return false;
  }
  return ALLOWED_ROOTS.has(segments[0] ?? "");
}
