import { API_PROXY_PREFIX } from "@/lib/api";

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export type ReviewDto = {
  id: string;
  serviceId: string;
  orderId: string;
  rating: number;
  body: string;
  serviceTitle: string;
  categorySlug: string;
  lineKind: "sale" | "hire" | null;
  reviewerDisplayName: string;
  createdAt: string;
};

export type EligibleReviewDto = {
  orderId: string;
  serviceId: string;
  receiptNumber: string;
  serviceTitle: string;
  categorySlug: string;
  lineKind: "sale" | "hire" | null;
  paidAt: string;
  hireEnd: string | null;
};

export type ServiceReviewSummary = {
  averageRating: number | null;
  reviewCount: number;
};

export async function fetchMyReviews(): Promise<ReviewDto[]> {
  const res = await fetch(proxyUrl("reviews/me"), {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json()) as { reviews?: ReviewDto[]; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to view your reviews.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load reviews.");
  }
  return Array.isArray(data.reviews) ? data.reviews : [];
}

export async function fetchEligibleReviews(): Promise<EligibleReviewDto[]> {
  const res = await fetch(proxyUrl("reviews/me/eligible"), {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json()) as {
    eligible?: EligibleReviewDto[];
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to view review options.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load eligible reviews.");
  }
  return Array.isArray(data.eligible) ? data.eligible : [];
}

export async function postReview(payload: {
  orderId: string;
  serviceId: string;
  rating: number;
  body: string;
}): Promise<ReviewDto> {
  const res = await fetch(proxyUrl("reviews"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { review?: ReviewDto; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to submit a review.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not submit review.");
  }
  if (!data.review) {
    throw new Error("Review was not returned");
  }
  return data.review;
}

export async function fetchServiceReviews(serviceId: string): Promise<{
  summary: ServiceReviewSummary;
  reviews: ReviewDto[];
}> {
  const res = await fetch(
    proxyUrl(`reviews/by-service/${encodeURIComponent(serviceId)}`),
    { credentials: "omit", cache: "no-store" },
  );
  const data = (await res.json()) as {
    summary?: ServiceReviewSummary;
    reviews?: ReviewDto[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load reviews.");
  }
  return {
    summary: data.summary ?? { averageRating: null, reviewCount: 0 },
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
}
