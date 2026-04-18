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

/** Stable order: catalog slugs first, then any extra categories. */
export function orderLandingCategories(
  rows: LandingServiceCategory[],
): LandingServiceCategory[] {
  const known = new Set<string>([...AMBUHUB_SERVICE_SLUGS]);
  const bySlug = new Map(rows.map((c) => [c.slug, c]));
  const ordered: LandingServiceCategory[] = [];

  for (const slug of AMBUHUB_SERVICE_SLUGS) {
    const c = bySlug.get(slug);
    if (c) {
      ordered.push(c);
    }
  }

  for (const c of rows) {
    if (!known.has(c.slug)) {
      ordered.push(c);
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
