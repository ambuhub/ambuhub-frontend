import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryServiceListing } from "@/components/services/CategoryServiceListing";
import {
  BROWSE_COUNTRY_COOKIE,
  parseBrowseCountry,
  type MarketplaceBrowseCountry,
} from "@/lib/browse-country";
import {
  fetchProviderShopBySlug,
  shopCategoriesInCatalogOrder,
} from "@/lib/provider-shop";
import {
  fetchServiceCategoriesList,
  groupMarketplaceByDepartments,
} from "@/lib/service-category-page-data";
import { publicPageMetadata } from "@/lib/seo-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ countryCode?: string; category?: string }>;
};

async function resolveBrowseCountry(queryCountry?: string): Promise<{
  country: MarketplaceBrowseCountry;
  fromCookie: boolean;
}> {
  const fromQuery = parseBrowseCountry(queryCountry);
  if (fromQuery) {
    return { country: fromQuery, fromCookie: true };
  }
  const jar = await cookies();
  const fromCookie = parseBrowseCountry(jar.get(BROWSE_COUNTRY_COOKIE)?.value);
  if (fromCookie) {
    return { country: fromCookie, fromCookie: true };
  }
  return { country: "NG", fromCookie: false };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shopPayload = await fetchProviderShopBySlug(slug);
  if (!shopPayload) {
    return { title: "Shop" };
  }
  return publicPageMetadata(
    shopPayload.shop.businessName,
    `Browse services from ${shopPayload.shop.businessName} on Ambuhub.`,
  );
}

export default async function ProviderShopPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const { country: initialCountry, fromCookie: hasCountryCookie } =
    await resolveBrowseCountry(sp.countryCode);

  const [payload, categoriesMeta] = await Promise.all([
    fetchProviderShopBySlug(slug, initialCountry),
    fetchServiceCategoriesList(),
  ]);

  if (!payload) {
    notFound();
  }

  const shopCategories = shopCategoriesInCatalogOrder(
    payload.services,
    categoriesMeta,
  );
  const requestedCategory = sp.category?.trim().toLowerCase();
  let initialCategory =
    shopCategories.find((c) => c.slug === requestedCategory) ??
    shopCategories[0] ??
    categoriesMeta[0] ??
    null;

  if (!initialCategory && payload.services[0]?.category) {
    const c = payload.services[0].category;
    initialCategory = {
      id: c.id,
      name: c.name,
      slug: c.slug,
      departments: [],
    };
  }

  if (!initialCategory) {
    initialCategory = {
      id: "empty",
      name: "Services",
      slug: "services",
      departments: [],
    };
  }

  const sections = groupMarketplaceByDepartments(
    initialCategory,
    payload.services,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <CategoryServiceListing
          mode="shop"
          category={initialCategory}
          sections={sections}
          initialCountry={initialCountry}
          hasCountryCookie={hasCountryCookie}
          shopSlug={payload.shop.shopSlug}
          shop={payload.shop}
          allShopServices={payload.services}
          categoriesMeta={categoriesMeta}
        />
      </main>
      <Footer />
    </div>
  );
}
