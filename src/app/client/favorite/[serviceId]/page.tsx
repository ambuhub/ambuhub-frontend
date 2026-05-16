import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailExtras } from "@/components/reviews/ListingDetailExtras";
import { ListingDetailMarketplaceActions } from "@/components/services/ListingDetailMarketplaceActions";
import { MarketplaceListingDetail } from "@/components/services/MarketplaceListingDetail";
import { fetchMarketplaceServiceByIdForPage } from "@/lib/service-category-page-data";

type PageProps = {
  params: Promise<{ serviceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = await fetchMarketplaceServiceByIdForPage(serviceId);
  if (!service) {
    return { title: "Listing | Client" };
  }
  const desc = service.description.trim();
  return {
    title: `${service.title} | Favorites`,
    description: desc.length > 160 ? `${desc.slice(0, 157)}…` : desc || undefined,
  };
}

export default async function ClientFavoriteListingDetailPage({
  params,
}: PageProps) {
  const { serviceId } = await params;
  const service = await fetchMarketplaceServiceByIdForPage(serviceId);
  if (!service) {
    notFound();
  }

  const authReturnPath = `/client/favorite/${encodeURIComponent(serviceId)}`;

  return (
    <div className="min-h-0 overflow-y-auto px-4 py-6 md:px-6">
      <MarketplaceListingDetail
        service={service}
        backHref="/client/favorite"
        backLabel="Back to favorites"
        variant="client"
      >
        <ListingDetailMarketplaceActions
          service={service}
          authReturnPath={authReturnPath}
        />
        <ListingDetailExtras serviceId={service.id} variant="client" />
      </MarketplaceListingDetail>
    </div>
  );
}
