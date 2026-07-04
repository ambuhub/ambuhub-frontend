"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, ExternalLink, Loader2 } from "lucide-react";
import {
  fetchAdminNotifications,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
  resolveAdminNotificationHref,
  type AdminNotificationDto,
} from "@/lib/admin-notifications";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-events";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function AdminNotificationCard({
  item,
  onMarkRead,
}: {
  item: AdminNotificationDto;
  onMarkRead: (id: string) => void;
}) {
  const unread = !item.readAt;
  const href = resolveAdminNotificationHref(item);

  async function handleOpen() {
    if (unread) {
      try {
        await markAdminNotificationRead(item.id);
        onMarkRead(item.id);
      } catch {
        /* navigate anyway */
      }
    }
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 sm:p-6 ${
        unread
          ? "border-indigo-300/60 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/50 ring-indigo-200/50"
          : "border-slate-200 bg-white ring-slate-100 opacity-90"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
            unread
              ? "bg-gradient-to-br from-indigo-600 to-violet-700"
              : "bg-slate-400"
          }`}
        >
          <Bell className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-indigo-950">{item.title}</h3>
            {unread ? (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-800">
                New
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
            <Link
              href={href}
              onClick={() => void handleOpen()}
              className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline"
            >
              View
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

type Props = {
  title?: string;
  description?: string;
  pageSize?: number;
};

export function AdminNotificationInbox({
  title = "Notifications",
  description = "Alerts for new concierge requests and other admin activity.",
  pageSize = 20,
}: Props) {
  const [items, setItems] = useState<AdminNotificationDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (cursor?: string) => {
      const isInitial = !cursor;
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const result = await fetchAdminNotifications({
          limit: pageSize,
          cursor,
        });
        setItems((prev) =>
          isInitial ? result.notifications : [...prev, ...result.notifications],
        );
        setNextCursor(result.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load notifications.");
      } finally {
        if (isInitial) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [pageSize],
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    function onUpdated() {
      void loadPage();
    }
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
  }, [loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextCursor) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !loadingMore) {
          void loadPage(nextCursor);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loadPage]);

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllAdminNotificationsRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-indigo-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={markingAll}
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 disabled:opacity-60"
          >
            {markingAll ? "Marking…" : "Mark all as read"}
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-label="Loading" />
        </div>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 text-center text-sm text-slate-600">
          No notifications yet. You will be alerted here when a client submits a concierge
          request.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <AdminNotificationCard item={item} onMarkRead={handleMarkRead} />
            </li>
          ))}
        </ul>
      )}

      {loadingMore ? (
        <div className="mt-6 flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" aria-hidden />
        </div>
      ) : null}
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </div>
  );
}
