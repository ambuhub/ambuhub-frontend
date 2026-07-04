export const NOTIFICATIONS_UPDATED_EVENT = "ambuhub:notifications-updated";

export function dispatchNotificationsUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  }
}

export type FcmDataPayload = {
  notificationId?: string;
  type?: string;
  entityId?: string;
  deepLink?: string;
  priority?: string;
  category?: string;
};

const FCM_TOKEN_STORAGE_KEY = "ambuhub:fcm-token";

export function getStoredFcmToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

export function setStoredFcmToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  }
}
