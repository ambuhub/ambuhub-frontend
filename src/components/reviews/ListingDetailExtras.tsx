"use client";

import { ListingDetailReviewPrompt } from "@/components/reviews/ListingDetailReviewPrompt";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";

type Props = {
  serviceId: string;
  variant?: "public" | "client";
};

export function ListingDetailExtras({
  serviceId,
  variant = "public",
}: Props) {
  return (
    <div className={variant === "public" ? "space-y-8" : undefined}>
      <ListingDetailReviewPrompt serviceId={serviceId} variant={variant} />
      <ServiceReviewsSection serviceId={serviceId} variant={variant} />
    </div>
  );
}
