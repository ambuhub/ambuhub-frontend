"use client";

import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchServiceReviews, type ReviewDto } from "@/lib/reviews";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "text-ambuhub-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  variant,
}: {
  review: ReviewDto;
  variant: "public" | "client";
}) {
  const cardClass =
    variant === "public"
      ? "rounded-xl border border-cyan-300/45 bg-white/95 p-4 shadow-[0_0_22px_-8px_rgba(34,211,238,0.28)] ring-1 ring-sky-100/50"
      : "rounded-xl border border-ambuhub-100 bg-white p-4 shadow-sm";

  return (
    <article className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          {review.reviewerDisplayName}
        </p>
        <time
          dateTime={review.createdAt}
          className="text-xs text-foreground/55"
        >
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </time>
      </div>
      <div className="mt-2">
        <StarRow rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
        {review.body}
      </p>
    </article>
  );
}

type Props = {
  serviceId: string;
  variant?: "public" | "client";
};

export function ServiceReviewsSection({
  serviceId,
  variant = "public",
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchServiceReviews(serviceId);
        if (!cancelled) {
          setAverageRating(data.summary.averageRating);
          setReviewCount(data.summary.reviewCount);
          setReviews(data.reviews);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const isPublic = variant === "public";

  const sectionClass = isPublic
    ? "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/25 p-6 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35)] ring-1 ring-cyan-200/40 sm:p-8"
    : "mt-10 border-t border-ambuhub-100 pt-8";

  const headingClass = isPublic
    ? "text-lg font-semibold text-[#004a7c]"
    : "text-lg font-semibold text-[#0c4a6e]";

  return (
    <section className={sectionClass}>
      {isPublic ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]"
          aria-hidden
        />
      ) : null}
      <div className={isPublic ? "relative" : undefined}>
      <h2 className={isPublic ? "text-lg font-semibold text-[#004a7c]" : headingClass}>
        Reviews
      </h2>
      {loading ? (
        <div className="mt-6 flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-ambuhub-brand" aria-label="Loading" />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : reviewCount === 0 ? (
        <p className="mt-4 text-sm text-foreground/65">
          No reviews yet. Verified buyers and hirers can leave the first review after
          completing a purchase or hire.
        </p>
      ) : (
        <>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/80">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {averageRating?.toFixed(1) ?? "—"}
            </span>
            <span>
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </span>
          </p>
          <ul className="mt-6 flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} variant={variant} />
              </li>
            ))}
          </ul>
        </>
      )}
      </div>
    </section>
  );
}
