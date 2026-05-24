"use client";

import { ListingDetailReviewPrompt } from "@/components/reviews/ListingDetailReviewPrompt";
import { ListingRecommendations } from "@/components/reviews/ListingRecommendations";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";
import type { ListingRecommendation } from "@/lib/listing-recommendations";

type Props = {
  serviceId: string;
  variant?: "public" | "client";
  recommendations?: ListingRecommendation[];
  categorySlug?: string;
  categoryName?: string;
};

export function ListingDetailExtras({
  serviceId,
  variant = "public",
  recommendations = [],
  categorySlug = "",
  categoryName = "",
}: Props) {
  const isPublic = variant === "public";

  return (
    <div className={isPublic ? "space-y-8" : undefined}>
      {!isPublic ? (
        <ListingDetailReviewPrompt serviceId={serviceId} variant={variant} />
      ) : null}
      <ServiceReviewsSection serviceId={serviceId} variant={variant} />
      {isPublic && recommendations.length > 0 && categorySlug ? (
        <ListingRecommendations
          recommendations={recommendations}
          categorySlug={categorySlug}
          categoryName={categoryName || categorySlug}
        />
      ) : null}
    </div>
  );
}
