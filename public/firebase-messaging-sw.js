/* eslint-disable no-undef */
// Service worker uses Firebase compat via CDN (required for SW importScripts).
// Main app uses modular Firebase SDK in src/lib/firebase.ts.
importScripts("/firebase-messaging-config.js");
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

firebase.initializeApp(self.FIREBASE_MESSAGING_CONFIG);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Ambuhub";
  const body = payload.notification?.body ?? "";
  const deepLink = payload.data?.deepLink ?? "/";

  self.registration.showNotification(title, {
    body,
    icon: "/ambuhub-logo.png",
    badge: "/ambuhub-logo.png",
    data: { ...payload.data, deepLink },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(deepLink);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(deepLink);
        }
        return undefined;
      }),
  );
});
