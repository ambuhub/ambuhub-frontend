import { getServerBackendOrigin } from "@/lib/server-backend-origin";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

export type ProviderShopInfo = {
  shopSlug: string;
  businessName: string;
  physicalAddress: string;
  website: string | null;
};

export type ProviderShopPayload = {
  shop: ProviderShopInfo;
  services: MarketplaceServiceRow[];
};

export type ShopCategorySection = {
  key: string;
  heading: string;
  categorySlug: string;
  departments: {
    key: string;
    heading: string;
    services: MarketplaceServiceRow[];
  }[];
};

export async function fetchProviderShopBySlug(
  shopSlug: string,
  countryCode?: "NG" | "GH",
): Promise<ProviderShopPayload | null> {
  const trimmed = shopSlug?.trim().toLowerCase() ?? "";
  if (!trimmed) {
    return null;
  }
  const base = getServerBackendOrigin();
  const qs =
    countryCode != null
      ? `?countryCode=${encodeURIComponent(countryCode)}`
      : "";
  try {
    const res = await fetch(
      `${base}/api/services/shop/${encodeURIComponent(trimmed)}${qs}`,
      { next: { revalidate: 60 } },
    );
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      shop?: ProviderShopInfo;
      services?: MarketplaceServiceRow[];
    };
    if (!data.shop?.shopSlug) {
      return null;
    }
    return {
      shop: data.shop,
      services: Array.isArray(data.services) ? data.services : [],
    };
  } catch {
    return null;
  }
}

/** Group shop services by category, then department. */
export function groupShopServicesByCategory(
  services: MarketplaceServiceRow[],
): ShopCategorySection[] {
  const byCategory = new Map<
    string,
    {
      name: string;
      slug: string;
      byDept: Map<string, { name: string; services: MarketplaceServiceRow[] }>;
    }
  >();

  for (const svc of services) {
    const catSlug = svc.category?.slug || "unknown";
    const catName = svc.category?.name || "Other";
    let cat = byCategory.get(catSlug);
    if (!cat) {
      cat = { name: catName, slug: catSlug, byDept: new Map() };
      byCategory.set(catSlug, cat);
    }
    const deptSlug = svc.departmentSlug || "general";
    const deptName = svc.departmentName || deptSlug;
    let dept = cat.byDept.get(deptSlug);
    if (!dept) {
      dept = { name: deptName, services: [] };
      cat.byDept.set(deptSlug, dept);
    }
    dept.services.push(svc);
  }

  return Array.from(byCategory.entries()).map(([catSlug, cat]) => ({
    key: catSlug,
    heading: cat.name,
    categorySlug: cat.slug,
    departments: Array.from(cat.byDept.entries()).map(([deptSlug, dept]) => ({
      key: `${catSlug}-${deptSlug}`,
      heading: dept.name,
      services: dept.services,
    })),
  }));
}
