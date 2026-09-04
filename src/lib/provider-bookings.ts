import { API_PROXY_PREFIX } from "@/lib/api";
import {
  API_PAGE_SIZE,
  readPaginationMeta,
  withPageParams,
  type PaginationMeta,
} from "@/lib/paginate";

export type ProviderHireBookingCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ProviderHireBookingRow = {
  orderId: string;
  receiptNumber: string;
  paidAt: string;
  currency: string;
  serviceId: string;
  listingTitle: string;
  hireStart: string;
  hireEnd: string;
  pricingPeriod: string;
  hireBillableUnits: number;
  quantity: number;
  lineTotal: number;
  customer: ProviderHireBookingCustomer;
  primaryPhotoUrl?: string;
};

/**
 * Fetches one page of `orders/provider/hire-bookings`. The screen renders a page at a time — "Load more"
 * on small screens, numbered pages on large — so it no longer pulls the whole
 * history up front.
 */
export async function fetchProviderHireBookings(
  page = 1,
  limit = API_PAGE_SIZE,
): Promise<{ items: ProviderHireBookingRow[]; meta: PaginationMeta }> {
  const params = withPageParams(new URLSearchParams(), page, limit);
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/hire-bookings?${params.toString()}`, {
    credentials: "include",
  });
  const data = (await res.json()) as { bookings?: ProviderHireBookingRow[]; message?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sign in to view bookings.");
    }
    if (res.status === 403) {
      throw new Error("Only service providers can view hire bookings.");
    }
    throw new Error(data.message ?? "Could not load bookings.");
  }

  return {
    items: Array.isArray(data.bookings) ? data.bookings : [],
    meta: readPaginationMeta(data),
  };
}

export type ProviderPersonnelBookingRow = {
  orderId: string;
  receiptNumber: string;
  paidAt: string;
  currency: string;
  serviceId: string;
  listingTitle: string;
  bookStart: string;
  bookEnd: string;
  pricingPeriod: string;
  bookBillableUnits: number;
  quantity: number;
  lineTotal: number;
  customer: ProviderHireBookingCustomer;
  primaryPhotoUrl?: string;
};

/**
 * Fetches one page of `orders/provider/bookings`. The screen renders a page at a time — "Load more"
 * on small screens, numbered pages on large — so it no longer pulls the whole
 * history up front.
 */
export async function fetchProviderPersonnelBookings(
  page = 1,
  limit = API_PAGE_SIZE,
): Promise<{ items: ProviderPersonnelBookingRow[]; meta: PaginationMeta }> {
  const params = withPageParams(new URLSearchParams(), page, limit);
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/bookings?${params.toString()}`, {
    credentials: "include",
  });
  const data = (await res.json()) as { bookings?: ProviderPersonnelBookingRow[]; message?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sign in to view bookings.");
    }
    if (res.status === 403) {
      throw new Error("Only service providers can view bookings.");
    }
    throw new Error(data.message ?? "Could not load bookings.");
  }

  return {
    items: Array.isArray(data.bookings) ? data.bookings : [],
    meta: readPaginationMeta(data),
  };
}

export type ProviderSaleRow = {
  orderId: string;
  receiptNumber: string;
  paidAt: string;
  currency: string;
  serviceId: string;
  listingTitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customer: ProviderHireBookingCustomer;
  primaryPhotoUrl?: string;
};

/**
 * Fetches one page of `orders/provider/sales`. The screen renders a page at a time — "Load more"
 * on small screens, numbered pages on large — so it no longer pulls the whole
 * history up front.
 */
export async function fetchProviderSales(
  page = 1,
  limit = API_PAGE_SIZE,
): Promise<{ items: ProviderSaleRow[]; meta: PaginationMeta }> {
  const params = withPageParams(new URLSearchParams(), page, limit);
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/sales?${params.toString()}`, {
    credentials: "include",
  });
  const data = (await res.json()) as { sales?: ProviderSaleRow[]; message?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sign in to view sales.");
    }
    if (res.status === 403) {
      throw new Error("Only service providers can view sales.");
    }
    throw new Error(data.message ?? "Could not load sales.");
  }

  return {
    items: Array.isArray(data.sales) ? data.sales : [],
    meta: readPaginationMeta(data),
  };
}
