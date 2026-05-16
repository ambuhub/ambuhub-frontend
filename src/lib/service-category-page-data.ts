import { getApiBaseUrl } from "@/lib/api";
import {
  AMBUHUB_SERVICE_SLUGS,
  getServiceBySlug,
} from "@/lib/ambuhub-services";
import type { BookingWindow } from "@/lib/booking-window";
import type { HireReturnWindow } from "@/lib/hire-return-window";
import type { PricingPeriod } from "@/lib/pricing-period";
import { MARKETPLACE_SERVICES_CACHE_TAG } from "@/lib/cache-tags";

const REVALIDATE = 120;

export type ServiceCategoryPageDto = {
  id: string;
  name: string;
  slug: string;
  departments: { name: string; slug: string; order: number }[];
  thumbnailUrl?: string;
  bannerUrl?: string;
  note?: string;
};

export type MarketplaceServiceRow = {
  id: string;
  title: string;
  description: string;
  listingType: "sale" | "hire" | "book" | null;
  stock: number | null;
  price: number | null;
  pricingPeriod: PricingPeriod | null;
  isAvailable?: boolean;
  departmentSlug: string;
  departmentName: string;
  category: { id: string; slug: string; name: string };
  photoUrls: string[];
  countryCode?: string | null;
  stateProvince?: string | null;
  stateProvinceName?: string | null;
  officeAddress?: string | null;
  hireReturnWindow?: HireReturnWindow | null;
  bookingWindow?: BookingWindow | null;
  bookingGapMinutes?: number | null;
};

export type DepartmentServiceSection = {
  key: string;
  heading: string;
  services: MarketplaceServiceRow[];
};

/**
 * @returns `null` when category is missing (404).
 * @throws on other HTTP failures or network errors.
 */
export async function fetchServiceCategoryBySlug(
  slug: string,
): Promise<ServiceCategoryPageDto | null> {
  const base = getApiBaseUrl();
  const res = await fetch(
    `${base}/api/service-categories/${encodeURIComponent(slug)}`,
    { next: { revalidate: REVALIDATE } },
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to load service category (${res.status})`);
  }
  const data = (await res.json()) as { serviceCategory?: ServiceCategoryPageDto };
  return data.serviceCategory ?? null;
}

export async function fetchMarketplaceServices(): Promise<MarketplaceServiceRow[]> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/services/marketplace`, {
      next: {
        revalidate: REVALIDATE,
        tags: [MARKETPLACE_SERVICES_CACHE_TAG],
      },
    });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { services?: MarketplaceServiceRow[] };
    return Array.isArray(data.services) ? data.services : [];
  } catch {
    return [];
  }
}

function isLikelyMongoObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

/**
 * Server-only fetch for listing detail pages (uses backend origin + ISR tag).
 */
export async function fetchMarketplaceServiceByIdForPage(
  serviceId: string,
): Promise<MarketplaceServiceRow | null> {
  const trimmed = serviceId?.trim() ?? "";
  if (!trimmed || !isLikelyMongoObjectId(trimmed)) {
    return null;
  }
  const base = getApiBaseUrl();
  try {
    const res = await fetch(
      `${base}/api/services/marketplace/${encodeURIComponent(trimmed)}`,
      {
        next: {
          revalidate: REVALIDATE,
          tags: [MARKETPLACE_SERVICES_CACHE_TAG],
        },
      },
    );
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { service?: MarketplaceServiceRow };
    return data.service ?? null;
  } catch {
    return null;
  }
}

/** Slugs for `generateStaticParams`; falls back to catalog slugs if the API is unreachable. */
export async function fetchServiceCategorySlugsForStaticParams(): Promise<
  string[]
> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/service-categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return [...AMBUHUB_SERVICE_SLUGS];
    }
    const data = (await res.json()) as {
      serviceCategories?: { slug: string }[];
    };
    const rows = data.serviceCategories;
    if (!Array.isArray(rows) || rows.length === 0) {
      return [...AMBUHUB_SERVICE_SLUGS];
    }
    return rows.map((c) => c.slug);
  } catch {
    return [...AMBUHUB_SERVICE_SLUGS];
  }
}

export function getCategoryPageTitleDescription(
  category: ServiceCategoryPageDto,
): { title: string; description: string } {
  const note = category.note?.trim();
  const staticMeta = getServiceBySlug(category.slug);
  const title = category.name?.trim() || staticMeta?.title || "Services";
  const description =
    note ||
    staticMeta?.description ||
    "Browse listings from verified providers in this category.";
  return { title, description };
}

export function groupMarketplaceByDepartments(
  category: ServiceCategoryPageDto,
  marketplace: MarketplaceServiceRow[],
): DepartmentServiceSection[] {
  const inCategory = marketplace.filter(
    (s) => s.category.slug === category.slug,
  );
  const byDept = new Map<string, MarketplaceServiceRow[]>();
  for (const s of inCategory) {
    const list = byDept.get(s.departmentSlug) ?? [];
    list.push(s);
    byDept.set(s.departmentSlug, list);
  }

  const sections: DepartmentServiceSection[] = [];
  const used = new Set<string>();

  for (const d of category.departments) {
    const list = byDept.get(d.slug);
    if (list?.length) {
      sections.push({ key: d.slug, heading: d.name, services: list });
      used.add(d.slug);
    }
  }

  for (const [deptSlug, list] of byDept) {
    if (!used.has(deptSlug) && list.length > 0) {
      const heading = list[0]?.departmentName ?? deptSlug;
      sections.push({
        key: `other-${deptSlug}`,
        heading,
        services: list,
      });
    }
  }

  return sections;
}
