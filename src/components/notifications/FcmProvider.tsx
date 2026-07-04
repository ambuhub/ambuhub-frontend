"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getFirebaseMessaging,
  getToken,
  getVapidKey,
  isFirebaseConfigured,
  isSupported,
  onMessage,
} from "@/lib/firebase";
import {
  deleteDeviceToken,
  refreshDeviceToken,
  registerDeviceToken,
} from "@/lib/notifications";
import {
  dispatchNotificationsUpdated,
  getStoredFcmToken,
  setStoredFcmToken,
} from "@/lib/notification-events";
import { useNotificationToast } from "@/components/notifications/NotificationToast";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";

const SW_PATH = "/firebase-messaging-sw.js";

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register(SW_PATH);
  } catch {
    return null;
  }
}

export function FcmProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSessionAndCart();
  const { showToast } = useNotificationToast();
  const registeredRef = useRef(false);

  const syncToken = useCallback(async () => {
    if (!user || !isFirebaseConfigured()) {
      return;
    }

    const supported = await isSupported();
    if (!supported || typeof Notification === "undefined") {
      return;
    }

    if (Notification.permission === "denied") {
      return;
    }

    if (Notification.permission === "default") {
      return;
    }

    const vapidKey = getVapidKey();
    if (!vapidKey) {
      return;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return;
    }

    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return;
    }

    const newToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!newToken) {
      return;
    }

    const oldToken = getStoredFcmToken();
    if (oldToken && oldToken !== newToken) {
      await refreshDeviceToken({
        oldToken,
        newToken,
        platform: "web",
        deviceName: navigator.userAgent.slice(0, 120),
      });
    } else if (!oldToken) {
      await registerDeviceToken({
        fcmToken: newToken,
        platform: "web",
        deviceName: navigator.userAgent.slice(0, 120),
      });
    } else {
      await registerDeviceToken({
        fcmToken: newToken,
        platform: "web",
        deviceName: navigator.userAgent.slice(0, 120),
      });
    }

    setStoredFcmToken(newToken);
  }, [user]);

  useEffect(() => {
    if (loading || !user) {
      registeredRef.current = false;
      return;
    }

    if (registeredRef.current) {
      return;
    }
    registeredRef.current = true;

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      await syncToken();

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        return;
      }

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "Ambuhub";
        const body = payload.notification?.body ?? "";
        showToast({
          title,
          body,
          data: payload.data as Record<string, string>,
          deepLink: payload.data?.deepLink,
        });
        dispatchNotificationsUpdated();
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, [loading, user, syncToken, showToast]);

  return <>{children}</>;
}

export async function unregisterFcmToken(): Promise<void> {
  const token = getStoredFcmToken();
  if (token) {
    try {
      await deleteDeviceToken(token);
    } catch {
      /* best effort */
    }
    setStoredFcmToken(null);
  }
}

export async function requestNotificationPermissionAndRegister(): Promise<boolean> {
  if (!isFirebaseConfigured() || typeof Notification === "undefined") {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission === "denied") {
    return false;
  }
  const result = await Notification.requestPermission();
  return result === "granted";
}
