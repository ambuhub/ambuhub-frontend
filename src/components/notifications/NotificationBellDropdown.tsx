"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import {
  fetchMyNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationHref,
  type NotificationDto,
} from "@/lib/notifications";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-events";
import {
  requestNotificationPermissionAndRegister,
} from "@/components/notifications/FcmProvider";

type Props = {
  notificationsHref: string;
  accentClass?: string;
};

function formatRelativeTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function NotificationBellDropdown({
  notificationsHref,
  accentClass = "text-cyan-400",
}: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      setCount(await fetchUnreadNotificationCount());
    } catch {
      setCount(0);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMyNotifications({ limit: 8 });
      setItems(result.notifications);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    function onUpdated() {
      void refreshCount();
      if (open) {
        void loadRecent();
      }
    }
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
  }, [open, refreshCount, loadRecent]);

  useEffect(() => {
    if (open) {
      void loadRecent();
    }
  }, [open, loadRecent]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleEnablePush() {
    const granted = await requestNotificationPermissionAndRegister();
    if (granted) {
      window.location.reload();
    }
  }

  const badgeLabel = count > 99 ? "99+" : String(count);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-white/10"
        aria-expanded={open}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className={`h-5 w-5 ${accentClass}`} aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            {count > 0 ? (
              <button
                type="button"
                className="text-xs font-semibold text-[#0069b4] hover:underline"
                onClick={() => {
                  void markAllNotificationsRead().then(() => {
                    void refreshCount();
                    void loadRecent();
                  });
                }}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {typeof Notification !== "undefined" &&
          Notification.permission === "default" ? (
            <div className="border-b border-slate-100 px-4 py-2">
              <button
                type="button"
                onClick={() => void handleEnablePush()}
                className="text-xs font-medium text-[#0069b4] hover:underline"
              >
                Enable push notifications
              </button>
            </div>
          ) : null}

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              <ul>
                {items.map((item) => {
                  const unread = !item.readAt;
                  const href = resolveNotificationHref(item);
                  return (
                    <li key={item.id} className="border-b border-slate-50 last:border-0">
                      <Link
                        href={href}
                        className={`block px-4 py-3 hover:bg-sky-50/50 ${unread ? "bg-sky-50/30" : ""}`}
                        onClick={() => {
                          setOpen(false);
                          if (unread) {
                            void markNotificationRead(item.id);
                          }
                        }}
                      >
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                          {item.body}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2">
            <Link
              href={notificationsHref}
              className="block text-center text-xs font-semibold text-[#0069b4] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
