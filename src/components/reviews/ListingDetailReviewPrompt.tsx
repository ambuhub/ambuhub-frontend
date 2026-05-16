"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import {
  fetchEligibleReviews,
  type EligibleReviewDto,
} from "@/lib/reviews";

type Props = {
  serviceId: string;
  variant?: "public" | "client";
};

export function ListingDetailReviewPrompt({
  serviceId,
  variant = "public",
}: Props) {
  const isPublic = variant === "public";
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/")}`;
  const [eligible, setEligible] = useState<EligibleReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setAuthRequired(false);
    try {
      const rows = await fetchEligibleReviews();
      const match = rows.find((r) => r.serviceId === serviceId) ?? null;
      setEligible(match);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Sign in")) {
        setAuthRequired(true);
        setEligible(null);
      } else {
        setEligible(null);
      }
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const wrapClass = isPublic
    ? "relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-white via-sky-50/35 to-cyan-50/20 p-5 shadow-[0_0_28px_-8px_rgba(34,211,238,0.3)] ring-1 ring-cyan-200/35 sm:p-6"
    : "space-y-3";

  const topAccent = isPublic ? (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400"
      aria-hidden
    />
  ) : null;

  if (loading || submitted) {
    if (submitted) {
      const okClass = isPublic
        ? "text-sm text-[#0c4a6e]"
        : "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-950";
      if (isPublic) {
        return (
          <div className={wrapClass}>
            {topAccent}
            <p className={`relative ${okClass}`}>
              Thank you — your review has been submitted.
            </p>
          </div>
        );
      }
      return (
        <p className={okClass}>
          Thank you — your review has been submitted.
        </p>
      );
    }
    return null;
  }

  if (authRequired) {
    if (isPublic) {
      return (
        <div className={wrapClass}>
          {topAccent}
          <p className="relative text-sm text-slate-600">
            <Link
              href={loginHref}
              className="font-semibold text-[#0069b4] underline underline-offset-2"
            >
              Sign in
            </Link>{" "}
            to leave a review after you have purchased or completed a hire.
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm text-foreground/75">
        <Link href={loginHref} className="font-semibold text-ambuhub-brand underline">
          Sign in
        </Link>{" "}
        to leave a review after you have purchased or completed a hire.
      </p>
    );
  }

  if (!eligible) {
    return null;
  }

  return (
    <div className={wrapClass}>
      {topAccent}
      <div className="relative space-y-3">
        <h3 className={`text-base font-semibold ${isPublic ? "text-[#004a7c]" : "text-foreground"}`}>
          Write a review
        </h3>
        <p className={`text-sm ${isPublic ? "text-slate-600" : "text-foreground/70"}`}>
          You completed a transaction for this listing (receipt{" "}
          {eligible.receiptNumber}). Share your experience with others.
        </p>
        <ReviewForm
          orderId={eligible.orderId}
          serviceId={eligible.serviceId}
          serviceTitle={eligible.serviceTitle}
          onSuccess={() => {
            setSubmitted(true);
            void load();
          }}
        />
      </div>
    </div>
  );
}
