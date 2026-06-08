import { API_PROXY_PREFIX } from "@/lib/api";

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

export async function fetchProviderHireBookings(): Promise<ProviderHireBookingRow[]> {
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/hire-bookings`, {
    credentials: "include",
  });
  const data = (await res.json()) as { bookings?: ProviderHireBookingRow[]; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to view bookings.");
  }
  if (res.status === 403) {
    throw new Error("Only service providers can view hire bookings.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load bookings.");
  }
  return Array.isArray(data.bookings) ? data.bookings : [];
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

export async function fetchProviderPersonnelBookings(): Promise<
  ProviderPersonnelBookingRow[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/bookings`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    bookings?: ProviderPersonnelBookingRow[];
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to view bookings.");
  }
  if (res.status === 403) {
    throw new Error("Only service providers can view bookings.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load bookings.");
  }
  return Array.isArray(data.bookings) ? data.bookings : [];
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

export async function fetchProviderSales(): Promise<ProviderSaleRow[]> {
  const res = await fetch(`${API_PROXY_PREFIX}/orders/provider/sales`, {
    credentials: "include",
  });
  const data = (await res.json()) as { sales?: ProviderSaleRow[]; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to view sales.");
  }
  if (res.status === 403) {
    throw new Error("Only service providers can view sales.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load sales.");
  }
  return Array.isArray(data.sales) ? data.sales : [];
}
