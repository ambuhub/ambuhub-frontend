import { API_PROXY_PREFIX } from "@/lib/api";

export type AdminNotificationDto = {
  id: string;
  type: "concierge_request_received";
  title: string;
  body: string;
  conciergeRequestId: string | null;
  readAt: string | null;
  createdAt: string;
};

function adminNotificationsError(
  res: Response,
  data: { message?: string },
): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to view notifications.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not load notifications.");
}

export function adminNotificationLinkHref(item: AdminNotificationDto): string {
  if (item.conciergeRequestId) {
    return `/admin/concierge-requests/${encodeURIComponent(item.conciergeRequestId)}`;
  }
  return "/admin/notifications";
}

export async function fetchAdminNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<AdminNotificationDto[]> {
  const search = new URLSearchParams();
  if (options?.unreadOnly) search.set("unreadOnly", "true");
  if (options?.limit != null) search.set("limit", String(options.limit));

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/notifications${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    notifications?: AdminNotificationDto[];
    message?: string;
  };

  if (!res.ok) {
    throw adminNotificationsError(res, data);
  }

  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function fetchAdminUnreadNotificationCount(): Promise<number> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/notifications/unread-count`, {
    credentials: "include",
  });
  const data = (await res.json()) as { count?: number; message?: string };

  if (!res.ok) {
    throw adminNotificationsError(res, data);
  }

  return typeof data.count === "number" ? data.count : 0;
}

export async function markAdminNotificationRead(
  notificationId: string,
): Promise<AdminNotificationDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH", credentials: "include" },
  );
  const data = (await res.json()) as {
    notification?: AdminNotificationDto;
    message?: string;
  };

  if (!res.ok || !data.notification) {
    throw adminNotificationsError(res, data);
  }

  return data.notification;
}

export async function markAllAdminNotificationsRead(): Promise<number> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = (await res.json()) as {
    modifiedCount?: number;
    message?: string;
  };

  if (!res.ok) {
    throw adminNotificationsError(res, data);
  }

  return typeof data.modifiedCount === "number" ? data.modifiedCount : 0;
}
