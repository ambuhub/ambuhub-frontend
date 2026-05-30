import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminConciergeStatus = "pending" | "in_progress" | "resolved";
export type AdminConciergeStatusFilter = "all" | AdminConciergeStatus;

export type AdminConciergeStatusCounts = {
  all: number;
  pending: number;
  in_progress: number;
  resolved: number;
};

export type AdminConciergeListItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  categoryName: string;
  departmentName: string;
  status: AdminConciergeStatus;
  createdAt: string;
};

export type AdminConciergeDetail = AdminConciergeListItem & {
  countryCode: string;
  categorySlug: string;
  departmentSlug: string;
  description: string;
};

export type AdminConciergeListResult = {
  requests: AdminConciergeListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AdminConciergeStatusCounts;
};

export type FetchAdminConciergeParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminConciergeStatusFilter;
};

function adminConciergeError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view concierge requests.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load concierge requests.");
}

export async function fetchAdminConciergeRequests(
  params: FetchAdminConciergeParams = {},
): Promise<AdminConciergeListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/concierge-requests${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminConciergeListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.requests)) {
    throw adminConciergeError(res, data);
  }

  return data;
}

export async function fetchAdminConciergeDetail(
  requestId: string,
): Promise<AdminConciergeDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/concierge-requests/${encodeURIComponent(requestId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    request?: AdminConciergeDetail;
    message?: string;
  };

  if (res.status === 404) {
    throw new Error(data.message ?? "Concierge request not found.");
  }
  if (!res.ok || !data.request) {
    throw adminConciergeError(res, data);
  }

  return data.request;
}
