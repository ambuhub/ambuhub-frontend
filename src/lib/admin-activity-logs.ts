import { API_PROXY_PREFIX } from "@/lib/api";

export const ADMIN_ACTIVITY_ACTIONS = [
  "admin_created",
  "user_verified",
  "user_unverified",
  "user_suspended",
  "user_unsuspended",
  "user_promoted_to_provider",
  "user_demoted_to_client",
  "category_created",
  "category_updated",
  "listing_enabled",
  "listing_disabled",
] as const;

export type AdminActivityAction = (typeof ADMIN_ACTIVITY_ACTIONS)[number];

export type AdminActivityEntityType = "user" | "category" | "listing";

export type AdminActivityLogListItem = {
  id: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  action: AdminActivityAction;
  actionLabel: string;
  entityType: AdminActivityEntityType;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminActivityLogsListResult = {
  logs: AdminActivityLogListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminActivitySort = "newest" | "oldest";

export type FetchAdminActivityLogsParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  sort?: AdminActivitySort;
  action?: AdminActivityAction | "all";
  q?: string;
};

function adminActivityLogsError(
  res: Response,
  data: { message?: string },
): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view activity logs.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load activity logs.");
}

export async function fetchAdminActivityLogs(
  params: FetchAdminActivityLogsParams = {},
): Promise<AdminActivityLogsListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.from?.trim()) search.set("from", params.from.trim());
  if (params.to?.trim()) search.set("to", params.to.trim());
  if (params.sort) search.set("sort", params.sort);
  if (params.action && params.action !== "all") {
    search.set("action", params.action);
  }
  if (params.q?.trim()) search.set("q", params.q.trim());

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/activity-logs${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminActivityLogsListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.logs)) {
    throw adminActivityLogsError(res, data);
  }

  return data;
}
