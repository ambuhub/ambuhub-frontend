"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  fetchEligibleReviews,
  fetchMyReviews,
  type EligibleReviewDto,
  type ReviewDto,
} from "@/lib/reviews";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ReviewsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/client/reviews")}`;

  const [eligible, setEligible] = useState<EligibleReviewDto[] | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const preselectOrderId = searchParams.get("orderId");
  const preselectServiceId = searchParams.get("serviceId");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [el, rev] = await Promise.all([
        fetchEligibleReviews(),
        fetchMyReviews(),
      ]);
      setEligible(el);
      setReviews(rev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews.");
      setEligible(null);
      setReviews(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const initialExpandKey = useMemo(() => {
    if (!preselectOrderId || !preselectServiceId || !eligible?.length) {
      return null;
    }
    const match = eligible.find(
      (e) => e.orderId === preselectOrderId && e.serviceId === preselectServiceId,
    );
    return match ? `${match.orderId}:${match.serviceId}` : null;
  }, [eligible, preselectOrderId, preselectServiceId]);

  useEffect(() => {
    if (initialExpandKey && expandedKey === null) {
      setExpandedKey(initialExpandKey);
    }
  }, [initialExpandKey, expandedKey]);

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          Reviews
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Leave feedback only for listings you have purchased or hired. Hire
          reviews unlock after the hire period ends.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-10">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
        </div>
      ) : error ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900">
            {error}
          </div>
          {error.includes("Sign in") ? (
            <Link
              href={loginHref}
              className="inline-flex rounded-lg border border-cyan-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm"
            >
              Go to sign in
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          <section>
            <h2 className="text-lg font-semibold text-[#0c4a6e]">
              Awaiting your review
            </h2>
            {!eligible?.length ? (
              <p className="mt-4 rounded-2xl border border-dashed border-cyan-300/50 bg-white px-6 py-10 text-center text-sm text-slate-600">
                Nothing to review right now. After you buy or complete a hire, eligible
                listings will appear here and on your receipt.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {eligible.map((item) => {
                  const key = `${item.orderId}:${item.serviceId}`;
                  const open = expandedKey === key;
                  return (
                    <li
                      key={key}
                      className="overflow-hidden rounded-2xl border border-cyan-200/60 bg-white shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {item.serviceTitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Receipt {item.receiptNumber} ·{" "}
                            {item.lineKind === "hire" ? "Hire" : "Purchase"}
                            {item.hireEnd
                              ? ` · ended ${new Date(item.hireEnd).toLocaleDateString()}`
                              : null}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedKey(open ? null : key)
                          }
                          className="shrink-0 rounded-xl bg-[#0069b4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004a7c]"
                        >
                          {open ? "Close" : "Write review"}
                        </button>
                      </div>
                      {open ? (
                        <div className="border-t border-cyan-100 bg-slate-50/80 p-4 sm:p-5">
                          <ReviewForm
                            orderId={item.orderId}
                            serviceId={item.serviceId}
                            serviceTitle={item.serviceTitle}
                            compact
                            onSuccess={() => {
                              setExpandedKey(null);
                              void load();
                            }}
                            onCancel={() => setExpandedKey(null)}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0c4a6e]">Reviews you wrote</h2>
            {!reviews?.length ? (
              <p className="mt-4 text-sm text-slate-600">
                You have not submitted any reviews yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/client/favorite/${encodeURIComponent(r.serviceId)}`}
                          className="font-semibold text-[#0069b4] hover:underline"
                        >
                          {r.serviceTitle}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <StarDisplay rating={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {r.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-sm text-slate-600">
            <Link href="/client/orders" className="font-semibold text-[#0069b4] hover:underline">
              View orders
            </Link>{" "}
            for receipts and purchase history.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ClientReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-12 flex justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
        </div>
      }
    >
      <ReviewsPageContent />
    </Suspense>
  );
}
