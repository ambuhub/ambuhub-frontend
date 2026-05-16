import { API_PROXY_PREFIX } from "@/lib/api";

/** Matches backend `OrderSummaryDto` from GET /orders/me */
export type ClientOrderSummary = {
  id: string;
  receiptNumber: string;
  subtotalNgn: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  lineCount: number;
};

export async function fetchMyOrders(): Promise<ClientOrderSummary[]> {
  const res = await fetch(`${API_PROXY_PREFIX}/orders/me`, {
    credentials: "include",
  });
  const data = (await res.json()) as { orders?: ClientOrderSummary[]; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to view your orders.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load orders.");
  }
  return Array.isArray(data.orders) ? data.orders : [];
}
