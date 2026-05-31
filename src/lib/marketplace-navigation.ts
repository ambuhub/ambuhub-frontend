export function marketplaceCategoryHref(
  categorySlug: string | null | undefined,
): string {
  const slug = categorySlug?.trim();
  return slug ? `/services/${encodeURIComponent(slug)}` : "/#services";
}
