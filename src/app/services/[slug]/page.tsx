import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryServiceListing } from "@/components/services/CategoryServiceListing";
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

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [category, marketplace] = await Promise.all([
    fetchServiceCategoryBySlug(slug),
    fetchMarketplaceServices(),
  ]);

  if (!category) {
    notFound();
  }

  const sections = groupMarketplaceByDepartments(category, marketplace);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <CategoryServiceListing category={category} sections={sections} />
      </main>
      <Footer />
    </div>
  );
}
