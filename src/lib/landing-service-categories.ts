import { getApiBaseUrl } from "@/lib/api";
import { AMBUHUB_SERVICE_SLUGS } from "@/lib/ambuhub-services";

export type LandingServiceCategory = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  note?: string;
  departments?: { name: string; slug: string; order: number }[];
  createdAt?: string;
  updatedAt?: string;
};

const FALLBACK_THUMB = "/landing-page/landing-3.png";

export { FALLBACK_THUMB };

/** Canonical slug for comparisons (trims whitespace, lowercases). */
export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

/**
 * Fetch categories for the home page (server). Uses ISR-style revalidation.
 */
export async function fetchLandingServiceCategories(): Promise<
  LandingServiceCategory[]
> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/service-categories`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as {
      serviceCategories?: LandingServiceCategory[];
    };
    return Array.isArray(data.serviceCategories)
      ? data.serviceCategories
      : [];
  } catch {
    return [];
  }
}

/**
 * Stable order: catalog slugs first, then any extra categories.
 * Deduplicates by normalized slug so duplicate API rows or casing mismatches
 * cannot render two cards for the same category.
 */
export function orderLandingCategories(
  rows: LandingServiceCategory[],
): LandingServiceCategory[] {
  const dedupedBySlug = new Map<string, LandingServiceCategory>();
  for (const c of rows) {
    const key = normalizeSlug(c.slug);
    if (!dedupedBySlug.has(key)) {
      dedupedBySlug.set(key, c);
    }
  }

  const knownCatalog = new Set(
    AMBUHUB_SERVICE_SLUGS.map((s) => normalizeSlug(s)),
  );
  const ordered: LandingServiceCategory[] = [];
  const seen = new Set<string>();

  for (const slug of AMBUHUB_SERVICE_SLUGS) {
    const c = dedupedBySlug.get(normalizeSlug(slug));
    if (c) {
      ordered.push(c);
      seen.add(normalizeSlug(c.slug));
    }
  }

  for (const c of dedupedBySlug.values()) {
    const key = normalizeSlug(c.slug);
    if (!knownCatalog.has(key) && !seen.has(key)) {
      ordered.push(c);
      seen.add(key);
    }
  }

  return ordered;
}

export function isCloudinaryHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "res.cloudinary.com" || host.endsWith(".res.cloudinary.com");
  } catch {
    return false;
  }
}
