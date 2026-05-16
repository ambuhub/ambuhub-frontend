import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ListingDetailExtras } from "@/components/reviews/ListingDetailExtras";
import { ListingDetailMarketplaceActions } from "@/components/services/ListingDetailMarketplaceActions";
import { MarketplaceListingDetail } from "@/components/services/MarketplaceListingDetail";
import { fetchMarketplaceServiceByIdForPage } from "@/lib/service-category-page-data";

type PageProps = {
  params: Promise<{ slug: string; serviceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = await fetchMarketplaceServiceByIdForPage(serviceId);
  if (!service) {
    return { title: "Listing | Ambuhub" };
  }
  const desc = service.description.trim();
  return {
    title: `${service.title} | Ambuhub`,
    description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc || undefined,
  };
}

export default async function MarketplaceListingDetailPage({
  params,
}: PageProps) {
  const { slug, serviceId } = await params;
  const service = await fetchMarketplaceServiceByIdForPage(serviceId);
  if (!service) {
    notFound();
  }
  if (service.category.slug !== slug) {
    permanentRedirect(
      `/services/${encodeURIComponent(service.category.slug)}/${encodeURIComponent(service.id)}`,
    );
  }

  const authReturnPath = `/services/${encodeURIComponent(slug)}/${encodeURIComponent(serviceId)}`;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-slate-50/95 via-sky-50/30 to-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <MarketplaceListingDetail
          service={service}
          backHref={`/services/${encodeURIComponent(slug)}`}
          backLabel={`Back to ${service.category.name}`}
          variant="public"
          actions={
            <ListingDetailMarketplaceActions
              service={service}
              authReturnPath={authReturnPath}
              variant="public"
            />
          }
        >
          <ListingDetailExtras serviceId={service.id} variant="public" />
        </MarketplaceListingDetail>
      </main>
      <Footer />
    </div>
  );
}
