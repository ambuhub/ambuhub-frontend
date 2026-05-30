import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminUserRole = "client" | "service_provider" | "admin";

export type AdminUserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  role: AdminUserRole;
  emailVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  dateOfBirth: string | null;
};

export type AdminUsersRoleCounts = {
  all: number;
  client: number;
  service_provider: number;
  admin: number;
};

export type AdminUsersListResult = {
  users: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AdminUsersRoleCounts;
};

export type AdminUsersRoleFilter = "all" | AdminUserRole;

export type FetchAdminUsersParams = {
  page?: number;
  limit?: number;
  q?: string;
  role?: AdminUsersRoleFilter;
};

export type AdminUserProviderProfile = {
  businessName: string;
  physicalAddress: string;
  website: string | null;
};

export type AdminUserTransaction = {
  id: string;
  receiptNumber: string;
  subtotalNgn: number;
  currency: string;
  paidAt: string;
  createdAt: string;
  lineCount: number;
  direction: "purchase" | "sale";
};

export type AdminUserDetail = AdminUserListItem & {
  updatedAt: string;
  providerProfile: AdminUserProviderProfile | null;
  transactions: AdminUserTransaction[];
};

export type AdminUserAction =
  | "verify"
  | "unverify"
  | "suspend"
  | "unsuspend"
  | "promote_to_provider"
  | "demote_to_client";

function adminUsersError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view users.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load users.");
}

export async function fetchAdminUsers(
  params: FetchAdminUsersParams = {},
): Promise<AdminUsersListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.role && params.role !== "all") search.set("role", params.role);

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/users${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminUsersListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.users)) {
    throw adminUsersError(res, data);
  }

  return data;
}

export async function fetchAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/users/${encodeURIComponent(userId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    user?: AdminUserDetail;
    message?: string;
  };

  if (res.status === 404) {
    throw new Error(data.message ?? "User not found.");
  }
  if (!res.ok || !data.user) {
    throw adminUsersError(res, data);
  }

  return data.user;
}

export async function applyAdminUserAction(
  userId: string,
  action: AdminUserAction,
): Promise<AdminUserDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    },
  );
  const data = (await res.json()) as {
    user?: AdminUserDetail;
    message?: string;
  };

  if (!res.ok || !data.user) {
    if (res.status === 404) {
      throw new Error(data.message ?? "User not found.");
    }
    throw new Error(data.message ?? "Could not update user.");
  }

  return data.user;
}
