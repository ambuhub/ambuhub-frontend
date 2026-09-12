import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminContactStatus = "new" | "read" | "archived";
export type AdminContactStatusFilter = "all" | AdminContactStatus;

export type AdminContactStatusCounts = {
  all: number;
  new: number;
  read: number;
  archived: number;
};

export type AdminContactListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjectKey: string;
  subjectLabel: string;
  status: AdminContactStatus;
  createdAt: string;
};

export type AdminContactDetail = AdminContactListItem & {
  message: string;
};

export type AdminContactListResult = {
  messages: AdminContactListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  counts: AdminContactStatusCounts;
};

export type FetchAdminContactParams = {
  page?: number;
  limit?: number;
  q?: string;
  status?: AdminContactStatusFilter;
};

function adminContactError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view contact messages.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load contact messages.");
}

export async function fetchAdminContactMessages(
  params: FetchAdminContactParams = {},
): Promise<AdminContactListResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/contact-messages${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as AdminContactListResult & {
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.messages)) {
    throw adminContactError(res, data);
  }

  return data;
}

export async function fetchAdminContactDetail(
  messageId: string,
): Promise<AdminContactDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/contact-messages/${encodeURIComponent(messageId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    message?: AdminContactDetail;
    messageText?: string;
  } & Record<string, unknown>;

  const errorMessage =
    typeof data.message === "string" ? data.message : undefined;
  const detail =
    data.message && typeof data.message === "object"
      ? (data.message as AdminContactDetail)
      : null;

  if (res.status === 404) {
    throw new Error(errorMessage ?? "Contact message not found.");
  }
  if (!res.ok || !detail) {
    throw adminContactError(res, { message: errorMessage });
  }

  return detail;
}

export async function patchAdminContactStatus(
  messageId: string,
  status: AdminContactStatus,
): Promise<AdminContactDetail> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/contact-messages/${encodeURIComponent(messageId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  const data = (await res.json()) as {
    message?: AdminContactDetail | string;
  };

  const errorMessage =
    typeof data.message === "string" ? data.message : undefined;
  const detail =
    data.message && typeof data.message === "object"
      ? (data.message as AdminContactDetail)
      : null;

  if (!res.ok || !detail) {
    throw adminContactError(res, { message: errorMessage });
  }

  return detail;
}
