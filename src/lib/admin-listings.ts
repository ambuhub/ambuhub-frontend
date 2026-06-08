import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminListingType = "sale" | "hire" | "book";
export type AdminListingTypeFilter = "all" | AdminListingType;
export type AdminListingStatusFilter = "all" | "live" | "taken_down";

export type AdminListingStatusCounts = {
  all: number;
  live: number;
  taken_down: number;
};

export type AdminListingListItem = {
  id: string;
  title: string;
  listingType: AdminListingType | null;
  categoryName: string;
  categorySlug: string;
  departmentName: string;
  providerUserId: string;
  providerName: string;
  providerEmail: string;
  businessName: string | null;
  isLive: boolean;
  stock: number | null;
  price: number | null;
  currency: string;
  updatedAt: string;
  createdAt: string;
};

export type AdminListingProvider = {
  businessName: string;
  website: string | null;
  physicalAddress: string;
  phone: string | null;
  countryCode: string | null;
  contactName: string | null;
};

export type AdminListingDetail = AdminListingListItem & {
  description: string;
  departmentSlug: string;
  photoUrls: string[];
  countryCode: string | null;
  stateProvince: string | null;
  stateProvinceName: string | null;
  officeAddress: string | null;
  pricingPeriod: string | null;
  provider: AdminListingProvider | null;
  hireReturnWindow: unknown;
  bookingWindow: unknown;
  hourlyBookingSchedule: unknown;
  bookingGapHours: number | null;
};

export type AdminListingsListResult = {
  listings: AdminListingListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AdminListingStatusCounts;
};

export type FetchAdminListingsParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminListingStatusFilter;
  listingType?: AdminListingTypeFilter;
};

function adminListingsError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view listings.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load listings.");
}

export async function fetchAdminListings(
  params: FetchAdminListingsParams = {},
): Promise<AdminListingsListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }
  if (params.listingType && params.listingType !== "all") {
    search.set("listingType", params.listingType);
  }

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/listings${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminListingsListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.listings)) {
    throw adminListingsError(res, data);
  }

  return data;
}

export async function fetchAdminListingDetail(
  serviceId: string,
): Promise<AdminListingDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/listings/${encodeURIComponent(serviceId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as { listing?: AdminListingDetail; message?: string };

  if (!res.ok || !data.listing) {
    throw adminListingsError(res, data);
  }

  return data.listing;
}

export async function patchAdminListingAvailability(
  serviceId: string,
  isAvailable: boolean,
): Promise<AdminListingListItem> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/listings/${encodeURIComponent(serviceId)}/availability`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable }),
    },
  );
  const data = (await res.json()) as { listing?: AdminListingListItem; message?: string };

  if (!res.ok || !data.listing) {
    throw adminListingsError(res, data);
  }

  return data.listing;
}
