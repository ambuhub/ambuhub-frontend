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
  fetchMarketplaceServices,
  fetchServiceCategoryBySlug,
  fetchServiceCategorySlugsForStaticParams,
  getCategoryPageTitleDescription,
  groupMarketplaceByDepartments,
} from "@/lib/service-category-page-data";
import { publicPageMetadata } from "@/lib/seo-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchServiceCategorySlugsForStaticParams();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchServiceCategoryBySlug(slug);
  if (!category) {
    return { title: "Services" };
  }
  const { title, description } = getCategoryPageTitleDescription(category);
  return publicPageMetadata(title, description);
}

async function resolveBrowseCountry(): Promise<{
  country: MarketplaceBrowseCountry;
  fromCookie: boolean;
}> {
  const jar = await cookies();
  const fromCookie = parseBrowseCountry(jar.get(BROWSE_COUNTRY_COOKIE)?.value);
  if (fromCookie) {
    return { country: fromCookie, fromCookie: true };
  }
  return { country: "NG", fromCookie: false };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { country: initialCountry, fromCookie: hasCountryCookie } =
    await resolveBrowseCountry();

  const [category, marketplace] = await Promise.all([
    fetchServiceCategoryBySlug(slug),
    fetchMarketplaceServices(initialCountry),
  ]);

  if (!category) {
    notFound();
  }

  const sections = groupMarketplaceByDepartments(category, marketplace);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <CategoryServiceListing
          category={category}
          sections={sections}
          initialCountry={initialCountry}
          hasCountryCookie={hasCountryCookie}
        />
      </main>
      <Footer />
    </div>
  );
}
