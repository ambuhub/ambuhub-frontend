import { API_PROXY_PREFIX } from "@/lib/api";
import type { ReceiptDetailClient } from "@/lib/marketplace-cart";

export type AdminOrderLineKind = "sale" | "hire" | "book";

export type AdminOrderKindFilter = "all" | AdminOrderLineKind;

export type AdminOrderBuyerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminOrderListItem = {
  id: string;
  receiptNumber: string;
  subtotalNgn: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  lineCount: number;
  primaryLineKind: AdminOrderLineKind | "mixed";
  buyer: AdminOrderBuyerSummary;
  sellerSummary: string;
};

export type AdminOrderKindCounts = {
  all: number;
  sale: number;
  hire: number;
  book: number;
};

export type AdminOrdersListResult = {
  orders: AdminOrderListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AdminOrderKindCounts;
};

export type FetchAdminOrdersParams = {
  page?: number;
  limit?: number;
  q?: string;
  kind?: AdminOrderKindFilter;
};

export type AdminOrderLineDetail = {
  serviceId: string;
  sellerUserId: string | null;
  sellerName: string | null;
  lineKind: AdminOrderLineKind | null;
  title: string;
  unitPriceNgn: number;
  quantity: number;
  lineTotalNgn: number;
  categoryName: string;
  categorySlug: string;
  departmentName: string;
};

export type AdminOrderDetail = {
  id: string;
  receiptNumber: string;
  currency: string;
  subtotalNgn: number;
  paymentProvider: string;
  paystackReference: string;
  paystackSimulated: boolean;
  paidAt: string;
  createdAt: string;
  primaryLineKind: AdminOrderLineKind | "mixed";
  buyer: AdminOrderBuyerSummary & { phone: string; countryCode: string };
  lines: AdminOrderLineDetail[];
};

function adminOrdersError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view orders.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load orders.");
}

export async function fetchAdminOrders(
  params: FetchAdminOrdersParams = {},
): Promise<AdminOrdersListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.kind && params.kind !== "all") search.set("kind", params.kind);

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/orders${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminOrdersListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.orders)) {
    throw adminOrdersError(res, data);
  }

  return data;
}

export async function fetchAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/orders/${encodeURIComponent(orderId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    order?: AdminOrderDetail;
    message?: string;
  };

  if (res.status === 404) {
    throw new Error(data.message ?? "Order not found.");
  }
  if (!res.ok || !data.order) {
    throw adminOrdersError(res, data);
  }

  return data.order;
}

export async function fetchAdminOrderReceipt(
  orderId: string,
): Promise<ReceiptDetailClient> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/orders/${encodeURIComponent(orderId)}/receipt`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    receipt?: ReceiptDetailClient;
    message?: string;
  };

  if (res.status === 404) {
    throw new Error(data.message ?? "Receipt not found.");
  }
  if (!res.ok || !data.receipt) {
    throw adminOrdersError(res, data);
  }

  return data.receipt;
}
