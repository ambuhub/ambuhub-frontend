"use client";

import Link from "next/link";
import { ArrowRight, Loader2, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ServiceCardImage } from "@/components/services/CategoryServiceListing";
import type { ListingRecommendation } from "@/lib/listing-recommendations";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import { formatMoney } from "@/lib/currency";
import { getListingCurrency } from "@/lib/marketplace-listing";
import { fetchServiceReviews } from "@/lib/reviews";

function formatListingTypeLabel(
  listingType: "sale" | "hire" | "book" | null,
): string {
  if (listingType === "sale") return "Sale";
  if (listingType === "hire") return "Hire";
  if (listingType === "book") return "Book";
  return "Listing";
}

function formatPriceLine(rec: ListingRecommendation): string {
  const { service } = rec;
  if (typeof service.price !== "number") {
    return "Price on request";
  }
  const currency = getListingCurrency(service);
  const base = formatMoney(service.price, currency);
  if (
    service.listingType === "hire" &&
    service.pricingPeriod &&
    isPricingPeriod(service.pricingPeriod)
  ) {
    return `${base}${formatHirePricePeriodSuffix(service.pricingPeriod)}`;
  }
  if (service.listingType === "book" && service.pricingPeriod && isPricingPeriod(service.pricingPeriod)) {
    return `${base} / ${formatPricingPeriodLabel(service.pricingPeriod).toLowerCase()}`;
  }
  return base;
}

type Props = {
  recommendations: ListingRecommendation[];
  categorySlug: string;
  categoryName: string;
};

type RatingBoost = {
  averageRating: number | null;
  reviewCount: number;
};

export function ListingRecommendations({
  recommendations,
  categorySlug,
  categoryName,
}: Props) {
  const [ratings, setRatings] = useState<Record<string, RatingBoost>>({});
  const [ratingsLoading, setRatingsLoading] = useState(true);

  useEffect(() => {
    if (recommendations.length === 0) {
      setRatingsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setRatingsLoading(true);
      const entries = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const data = await fetchServiceReviews(rec.service.id);
            return [
              rec.service.id,
              {
                averageRating: data.summary.averageRating,
                reviewCount: data.summary.reviewCount,
              },
            ] as const;
          } catch {
            return [
              rec.service.id,
              { averageRating: null, reviewCount: 0 },
            ] as const;
          }
        }),
      );
      if (!cancelled) {
        setRatings(Object.fromEntries(entries));
        setRatingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recommendations]);

  const ranked = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      const ra = ratings[a.service.id];
      const rb = ratings[b.service.id];
      const boostA =
        ra?.averageRating != null
          ? ra.averageRating * 3 + Math.min(ra.reviewCount, 10) * 0.5
          : 0;
      const boostB =
        rb?.averageRating != null
          ? rb.averageRating * 3 + Math.min(rb.reviewCount, 10) * 0.5
          : 0;
      return b.score + boostB - (a.score + boostA);
    });
  }, [recommendations, ratings]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/35 to-cyan-50/20 p-6 shadow-[0_0_32px_-8px_rgba(34,211,238,0.32)] ring-1 ring-cyan-200/40 sm:p-8"
      aria-labelledby="listing-recommendations-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              For you
            </p>
            <h2
              id="listing-recommendations-heading"
              className="mt-1 text-lg font-semibold text-[#004a7c]"
            >
              Recommended listings
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Matched by category, service type, location, and price — ranked higher
              when other clients rated them well.
            </p>
          </div>
          {ratingsLoading ? (
            <Loader2
              className="h-5 w-5 shrink-0 animate-spin text-cyan-500"
              aria-label="Refining recommendations"
            />
          ) : null}
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ranked.map((rec) => {
            const href = `/services/${encodeURIComponent(rec.service.category.slug)}/${encodeURIComponent(rec.service.id)}`;
            const rating = ratings[rec.service.id];
            return (
              <li key={rec.service.id} className="min-w-0">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-200/60 bg-white shadow-sm transition hover:border-cyan-400/70 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.35)]">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
                    <Link
                      href={href}
                      className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                    >
                      <span className="sr-only">View {rec.service.title}</span>
                      <ServiceCardImage
                        photoUrl={rec.service.photoUrls[0]}
                        alt={rec.service.title}
                      />
                    </Link>
                    <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {formatListingTypeLabel(rec.service.listingType)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {rec.reasons.length > 0 ? (
                      <ul className="mb-2 flex flex-wrap gap-1">
                        {rec.reasons.map((reason) => (
                          <li
                            key={reason}
                            className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-2 py-0.5 text-[10px] font-medium text-[#0369a1]"
                          >
                            {reason}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <Link
                      href={href}
                      className="line-clamp-2 font-semibold text-[#004a7c] hover:text-cyan-700 hover:underline"
                    >
                      {rec.service.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {rec.service.departmentName}
                    </p>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                      <p className="text-sm font-bold text-[#0069b4]">
                        {formatPriceLine(rec)}
                      </p>
                      {rating?.averageRating != null && rating.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600">
                          <Star
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                            aria-hidden
                          />
                          {rating.averageRating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <Link
                      href={href}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-[#004a7c]"
                    >
                      View listing
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href={`/services/${encodeURIComponent(categorySlug)}`}
            className="font-semibold text-[#0069b4] hover:underline"
          >
            Browse all in {categoryName}
          </Link>
        </p>
      </div>
    </section>
  );
}
