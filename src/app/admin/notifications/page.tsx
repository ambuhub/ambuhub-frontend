"use client";

import Link from "next/link";
import { Bell, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  adminNotificationLinkHref,
  fetchAdminNotifications,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
  type AdminNotificationDto,
} from "@/lib/admin-notifications";

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

function NotificationCard({
  item,
  onMarkRead,
}: {
  item: AdminNotificationDto;
  onMarkRead: (id: string) => void;
}) {
  const unread = !item.readAt;
  const href = adminNotificationLinkHref(item);

  async function handleOpen() {
    if (unread) {
      try {
        await markAdminNotificationRead(item.id);
        onMarkRead(item.id);
      } catch {
        /* still navigate */
      }
    }
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6 ${
        unread
          ? "border-indigo-300/60 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/50 ring-1 ring-indigo-200/50"
          : "border-slate-200 bg-white opacity-90"
      }`}
    >
      <div className="relative flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-2 ring-white/70 ${
            unread
              ? "bg-gradient-to-br from-indigo-600 to-violet-700"
              : "bg-gradient-to-br from-slate-400 to-slate-600"
          }`}
        >
          <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-indigo-950">{item.title}</h2>
            {unread ? (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                New
              </span>
            ) : null}
            <span className="text-xs text-slate-500">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.body}</p>
          {item.conciergeRequestId ? (
            <Link
              href={href}
              onClick={() => void handleOpen()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50 sm:w-auto"
            >
              View concierge request
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotificationDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markAllBusy, setMarkAllBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminNotifications({ limit: 50 });
      setItems(rows);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev?.map((item) =>
        item.id === id
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ) ?? null,
    );
  }

  async function handleMarkAllRead() {
    setMarkAllBusy(true);
    try {
      await markAllAdminNotificationsRead();
      setItems((prev) =>
        prev?.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
        })) ?? null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark all as read.");
    } finally {
      setMarkAllBusy(false);
    }
  }

  const unreadCount = items?.filter((item) => !item.readAt).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Notifications"
        description="Alerts for new concierge requests and other admin activity."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up"}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={markAllBusy}
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 disabled:opacity-60"
          >
            {markAllBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Mark all as read
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600" aria-label="Loading" />
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-indigo-400" aria-hidden />
          <p className="mt-4 text-sm text-slate-600">
            No notifications yet. You will be alerted here when a client submits a
            concierge request.
          </p>
          <Link
            href="/admin/concierge-requests"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View concierge requests
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
