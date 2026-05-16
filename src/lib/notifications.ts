import { API_PROXY_PREFIX } from "@/lib/api";

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export type NotificationType =
  | "hire_return_reminder"
  | "provider_sale_purchased"
  | "provider_hire_booked"
  | "provider_hire_return_reminder";

export type NotificationDto = {
  id: string;
  type: NotificationType;
  reminderKind: "1d" | "1h" | null;
  title: string;
  body: string;
  orderId: string;
  serviceId: string;
  receiptNumber: string | null;
  deadlineAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export function notificationLinkHref(item: NotificationDto): string {
  switch (item.type) {
    case "provider_sale_purchased":
      return "/provider/listings";
    case "provider_hire_booked":
    case "provider_hire_return_reminder":
      return "/provider/bookings";
    default:
      return `/receipts/${encodeURIComponent(item.orderId)}`;
  }
}

export async function fetchMyNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<NotificationDto[]> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) {
    params.set("unreadOnly", "true");
  }
  if (options?.limit != null) {
    params.set("limit", String(options.limit));
  }
  const qs = params.toString();
  const res = await fetch(
    proxyUrl(`notifications/me${qs ? `?${qs}` : ""}`),
    { credentials: "include", cache: "no-store" },
  );
  const data = (await res.json()) as {
    notifications?: NotificationDto[];
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to view notifications.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load notifications.");
  }
  return Array.isArray(data.notifications) ? data.notifications : [];
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await fetch(proxyUrl("notifications/me/unread-count"), {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json()) as { count?: number; message?: string };
  if (res.status === 401) {
    return 0;
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load notification count.");
  }
  return typeof data.count === "number" ? data.count : 0;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationDto> {
  const res = await fetch(
    proxyUrl(`notifications/me/${encodeURIComponent(notificationId)}/read`),
    { method: "PATCH", credentials: "include" },
  );
  const data = (await res.json()) as {
    notification?: NotificationDto;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not update notification.");
  }
  if (!data.notification) {
    throw new Error("Could not update notification.");
  }
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await fetch(proxyUrl("notifications/me/read-all"), {
    method: "PATCH",
    credentials: "include",
  });
  const data = (await res.json()) as {
    modifiedCount?: number;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not mark notifications as read.");
  }
  return typeof data.modifiedCount === "number" ? data.modifiedCount : 0;
}
