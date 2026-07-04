"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { FcmDataPayload } from "@/lib/notification-events";
import { resolveNotificationHref, type NotificationDto } from "@/lib/notifications";

type ToastItem = {
  id: string;
  title: string;
  body: string;
  href: string;
};

type NotificationToastContextValue = {
  showToast: (input: {
    title: string;
    body: string;
    deepLink?: string;
    data?: FcmDataPayload;
    notification?: NotificationDto;
  }) => void;
};

const NotificationToastContext =
  createContext<NotificationToastContextValue | null>(null);

function resolveHref(input: {
  deepLink?: string;
  data?: FcmDataPayload;
  notification?: NotificationDto;
}): string {
  if (input.deepLink) {
    return input.deepLink;
  }
  if (input.data?.deepLink) {
    return input.data.deepLink;
  }
  if (input.notification) {
    return resolveNotificationHref(input.notification);
  }
  return "/client/notifications";
}

export function NotificationToastProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (input: {
      title: string;
      body: string;
      deepLink?: string;
      data?: FcmDataPayload;
      notification?: NotificationDto;
    }) => {
      const id = crypto.randomUUID();
      const href = resolveHref(input);
      setToasts((prev) => [...prev, { id, title: input.title, body: input.body, href }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    [],
  );

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <NotificationToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto overflow-hidden rounded-xl border border-sky-200/80 bg-white shadow-xl shadow-sky-900/10 ring-1 ring-sky-100"
          >
            <button
              type="button"
              className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-sky-50/60"
              onClick={() => {
                dismiss(toast.id);
                router.push(toast.href);
              }}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {toast.title}
                </span>
                <span className="mt-1 block text-sm text-slate-600 line-clamp-2">
                  {toast.body}
                </span>
              </span>
              <span
                role="button"
                tabIndex={0}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    dismiss(toast.id);
                  }
                }}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </span>
            </button>
          </div>
        ))}
      </div>
    </NotificationToastContext.Provider>
  );
}

export function useNotificationToast(): NotificationToastContextValue {
  const ctx = useContext(NotificationToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
    };
  }
  return ctx;
}
