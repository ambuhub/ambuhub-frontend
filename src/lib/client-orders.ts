import { API_PROXY_PREFIX } from "@/lib/api";
import {
  API_PAGE_SIZE,
  readPaginationMeta,
  withPageParams,
  type PaginationMeta,
} from "@/lib/paginate";

/** Matches backend `OrderSummaryDto` from GET /orders/me */
export type ClientOrderSummary = {
  id: string;
  receiptNumber: string;
  subtotal: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  lineCount: number;
};

/**
 * Fetches one page of `orders/me`. The screen renders a page at a time — "Load more"
 * on small screens, numbered pages on large — so it no longer pulls the whole
 * history up front.
 */
export async function fetchMyOrders(
  page = 1,
  limit = API_PAGE_SIZE,
): Promise<{ items: ClientOrderSummary[]; meta: PaginationMeta }> {
  const params = withPageParams(new URLSearchParams(), page, limit);
  const res = await fetch(`${API_PROXY_PREFIX}/orders/me?${params.toString()}`, {
    credentials: "include",
  });
  const data = (await res.json()) as { orders?: ClientOrderSummary[]; message?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sign in to view your orders.");
    }
    throw new Error(data.message ?? "Could not load orders.");
  }

  return {
    items: Array.isArray(data.orders) ? data.orders : [],
    meta: readPaginationMeta(data),
  };
}
