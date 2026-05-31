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

type ReviewVariant = "public" | "client" | "provider" | "admin";

function ReviewCard({
  review,
  variant,
}: {
  review: ReviewDto;
  variant: ReviewVariant;
}) {
  const cardClass =
    variant === "public"
      ? "rounded-xl border border-cyan-300/45 bg-white/95 p-4 shadow-[0_0_22px_-8px_rgba(34,211,238,0.28)] ring-1 ring-sky-100/50"
      : variant === "provider"
        ? "rounded-xl border border-cyan-300/45 bg-white/95 p-4 shadow-[0_0_22px_-8px_rgba(34,211,238,0.28)] ring-1 ring-sky-100/50"
        : variant === "admin"
          ? "rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          : "rounded-xl border border-ambuhub-100 bg-white p-4 shadow-sm";

  return (
    <article className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {review.reviewerDisplayName}
          </p>
          {variant === "admin" && review.lineKind ? (
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {review.lineKind === "hire"
                ? "Hire"
                : review.lineKind === "book"
                  ? "Booking"
                  : "Purchase"}
            </span>
          ) : null}
        </div>
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
  variant?: ReviewVariant;
  limit?: number;
};

export function ServiceReviewsSection({
  serviceId,
  variant = "public",
  limit,
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
        const data = await fetchServiceReviews(serviceId, { limit });
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
  }, [serviceId, limit]);

  const isPublic = variant === "public";
  const isProvider = variant === "provider";
  const isAdmin = variant === "admin";

  const sectionClass = isPublic
    ? "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/25 p-6 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35)] ring-1 ring-cyan-200/40 sm:p-8"
    : isProvider
      ? "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/25 p-5 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35),0_8px_24px_-12px_rgba(0,74,124,0.12)] ring-1 ring-cyan-200/40 sm:p-7"
      : isAdmin
        ? "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        : "mt-10 border-t border-ambuhub-100 pt-8";

  const headingClass = isPublic
    ? "text-lg font-semibold text-[#004a7c]"
    : isProvider
      ? "text-sm font-bold uppercase tracking-wide text-[#004a7c]"
      : isAdmin
        ? "text-sm font-semibold uppercase tracking-wide text-slate-500"
        : "text-lg font-semibold text-[#0c4a6e]";

  return (
    <section className={sectionClass}>
      {isPublic || isProvider ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]"
          aria-hidden
        />
      ) : null}
      <div className={isPublic || isProvider ? "relative" : undefined}>
      <h2 className={isPublic ? "text-lg font-semibold text-[#004a7c]" : headingClass}>
        {isProvider || isAdmin ? "Reviews & ratings" : "Reviews"}
      </h2>
      {loading ? (
        <div className="mt-6 flex justify-center py-8">
          <Loader2
            className={`h-8 w-8 animate-spin ${
              isProvider
                ? "text-cyan-600"
                : isAdmin
                  ? "text-indigo-600"
                  : "text-ambuhub-brand"
            }`}
            aria-label="Loading"
          />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : reviewCount === 0 ? (
        <p
          className={
            isProvider
              ? "mt-3 text-sm text-slate-600/90"
              : isAdmin
                ? "mt-3 text-sm text-slate-600"
                : "mt-4 text-sm text-foreground/65"
          }
        >
          {isProvider
            ? "No customer reviews yet. Ratings appear here after verified purchases, hires, or bookings."
            : isAdmin
              ? "No reviews for this listing yet."
              : "No reviews yet. Verified buyers, hirers, and bookers can leave the first review right after checkout."}
        </p>
      ) : (
        <>
          <p
            className={
              isProvider
                ? "mt-3 flex flex-wrap items-center gap-3"
                : isAdmin
                  ? "mt-4 flex flex-wrap items-center gap-3"
                  : "mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/80"
            }
          >
            <span
              className={
                isProvider
                  ? "inline-flex items-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-lg font-bold text-amber-950 shadow-[0_0_20px_-6px_rgba(251,191,36,0.45)]"
                  : isAdmin
                    ? "inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-lg font-bold text-amber-950"
                    : "inline-flex items-center gap-1 font-semibold text-foreground"
              }
            >
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
              {averageRating?.toFixed(1) ?? "—"}
            </span>
            <span
              className={
                isProvider || isAdmin
                  ? "text-sm font-medium text-slate-600"
                  : undefined
              }
            >
              Overall · {reviewCount} review{reviewCount === 1 ? "" : "s"}
              {isAdmin && reviews.length < reviewCount
                ? ` · showing latest ${reviews.length}`
                : ""}
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
