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
  | "provider_hire_return_reminder"
  | "provider_booking_confirmed"
  | "ambulance_request"
  | "request_accepted"
  | "request_rejected"
  | "ambulance_en_route"
  | "ambulance_arrived"
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_success"
  | "payment_failed"
  | "chat_message"
  | "order_shipped"
  | "order_delivered"
  | "general";

export type NotificationDto = {
  id: string;
  type: NotificationType;
  category?: string;
  priority?: string;
  reminderKind: "1d" | "1h" | null;
  title: string;
  body: string;
  deepLink?: string | null;
  entityId?: string | null;
  data?: Record<string, unknown>;
  orderId: string | null;
  serviceId: string | null;
  receiptNumber: string | null;
  deadlineAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResult = {
  notifications: NotificationDto[];
  nextCursor: string | null;
};

export type DevicePlatform = "web" | "android" | "ios";

export function resolveNotificationHref(item: NotificationDto): string {
  if (item.deepLink) {
    return item.deepLink;
  }
  return notificationLinkHref(item);
}

export function notificationLinkHref(item: NotificationDto): string {
  switch (item.type) {
    case "provider_sale_purchased":
      return "/provider/listings";
    case "provider_hire_booked":
    case "provider_hire_return_reminder":
    case "provider_booking_confirmed":
      return "/provider/bookings";
    case "payment_success":
    case "payment_failed":
      return item.orderId
        ? `/receipts/${encodeURIComponent(item.orderId)}`
        : "/client/orders";
    case "chat_message":
      return "/client/concierge";
    default:
      if (item.orderId) {
        return `/receipts/${encodeURIComponent(item.orderId)}`;
      }
      return "/client/notifications";
  }
}

export async function fetchMyNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
}): Promise<NotificationListResult> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) {
    params.set("unreadOnly", "true");
  }
  if (options?.limit != null) {
    params.set("limit", String(options.limit));
  }
  if (options?.cursor) {
    params.set("cursor", options.cursor);
  }
  const qs = params.toString();
  const res = await fetch(
    proxyUrl(`notifications/me${qs ? `?${qs}` : ""}`),
    { credentials: "include", cache: "no-store" },
  );
  const data = (await res.json()) as NotificationListResult & {
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to view notifications.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load notifications.");
  }
  return {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    nextCursor: data.nextCursor ?? null,
  };
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

export async function registerDeviceToken(input: {
  fcmToken: string;
  platform: DevicePlatform;
  deviceName?: string;
  appVersion?: string;
}): Promise<void> {
  const res = await fetch(proxyUrl("notifications/me/devices"), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "Could not register device token.");
  }
}

export async function refreshDeviceToken(input: {
  oldToken?: string;
  newToken: string;
  platform: DevicePlatform;
  deviceName?: string;
  appVersion?: string;
}): Promise<void> {
  const res = await fetch(proxyUrl("notifications/me/devices/refresh"), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "Could not refresh device token.");
  }
}

export async function deleteDeviceToken(fcmToken: string): Promise<void> {
  const res = await fetch(proxyUrl("notifications/me/devices"), {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken }),
  });
  if (res.status === 204) {
    return;
  }
  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "Could not remove device token.");
  }
}
