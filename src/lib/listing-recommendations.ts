import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

export type ListingRecommendation = {
  service: MarketplaceServiceRow;
  score: number;
  /** Short labels explaining why this listing was picked (shown in UI). */
  reasons: string[];
};

const DEFAULT_LIMIT = 4;

function listingTypeLabel(type: MarketplaceServiceRow["listingType"]): string {
  if (type === "hire") return "Hire";
  if (type === "book") return "Booking";
  if (type === "sale") return "Sale";
  return "Listing";
}

function isAvailable(row: MarketplaceServiceRow): boolean {
  return row.isAvailable !== false;
}

function scoreCandidate(
  current: MarketplaceServiceRow,
  candidate: MarketplaceServiceRow,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (candidate.category.slug === current.category.slug) {
    score += 40;
    reasons.push(current.category.name);
  }

  if (candidate.departmentSlug === current.departmentSlug) {
    score += 25;
    if (candidate.departmentName && candidate.departmentName !== current.category.name) {
      reasons.push(candidate.departmentName);
    }
  }

  if (
    current.listingType &&
    candidate.listingType === current.listingType
  ) {
    score += 20;
    reasons.push(listingTypeLabel(current.listingType));
  }

  const state = current.stateProvince?.trim();
  if (state && candidate.stateProvince?.trim() === state) {
    score += 15;
    const place =
      candidate.stateProvinceName?.trim() ||
      candidate.stateProvince?.trim() ||
      "your area";
    reasons.push(place);
  } else if (
    current.countryCode?.trim() &&
    candidate.countryCode?.trim() === current.countryCode.trim()
  ) {
    score += 8;
  }

  const currentPrice = current.price;
  const candidatePrice = candidate.price;
  if (
    typeof currentPrice === "number" &&
    currentPrice > 0 &&
    typeof candidatePrice === "number" &&
    candidatePrice > 0
  ) {
    const ratio = candidatePrice / currentPrice;
    if (ratio >= 0.65 && ratio <= 1.35) {
      score += 12;
      reasons.push("Similar price");
    }
  }

  if (candidate.photoUrls.length > 0) {
    score += 5;
  }

  const uniqueReasons = [...new Set(reasons.map((r) => r.trim()).filter(Boolean))];
  return { score, reasons: uniqueReasons.slice(0, 2) };
}

/**
 * Rank marketplace listings similar to `current` for detail-page recommendations.
 * Prefers same category, then fills from the wider catalog if needed.
 */
export function pickListingRecommendations(
  current: MarketplaceServiceRow,
  pool: MarketplaceServiceRow[],
  options?: { limit?: number },
): ListingRecommendation[] {
  const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), 8);

  const candidates = pool.filter(
    (row) => row.id !== current.id && isAvailable(row),
  );

  const scored: ListingRecommendation[] = candidates.map((service) => {
    const { score, reasons } = scoreCandidate(current, service);
    return { service, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);

  const sameCategory = scored.filter(
    (r) => r.service.category.slug === current.category.slug,
  );
  const other = scored.filter(
    (r) => r.service.category.slug !== current.category.slug,
  );

  const picked: ListingRecommendation[] = [];
  for (const row of sameCategory) {
    if (picked.length >= limit) break;
    picked.push(row);
  }
  for (const row of other) {
    if (picked.length >= limit) break;
    if (row.score < 15) continue;
    picked.push(row);
  }

  return picked;
}
