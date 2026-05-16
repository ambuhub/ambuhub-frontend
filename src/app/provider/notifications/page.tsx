"use client";

import Link from "next/link";
import { Bell, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationLinkHref,
  type NotificationDto,
} from "@/lib/notifications";

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

function formatDeadline(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function linkLabel(type: NotificationDto["type"]): string {
  if (type === "provider_sale_purchased") return "View listings";
  if (
    type === "provider_hire_booked" ||
    type === "provider_hire_return_reminder"
  ) {
    return "View bookings";
  }
  return "View details";
}

function NotificationCard({
  item,
  onMarkRead,
}: {
  item: NotificationDto;
  onMarkRead: (id: string) => void;
}) {
  const unread = !item.readAt;
  const href = notificationLinkHref(item);

  async function handleOpen() {
    if (unread) {
      try {
        await markNotificationRead(item.id);
        onMarkRead(item.id);
      } catch {
        /* still navigate */
      }
    }
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg ring-1 sm:p-6 ${
        unread
          ? "border-blue-500/40 bg-gradient-to-br from-white via-blue-50/50 to-sky-100/40 ring-blue-200/50 shadow-blue-900/10"
          : "border-slate-200/80 bg-white/95 ring-slate-100/60 opacity-90"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-500"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-2 ring-white/70 ${
            unread
              ? "bg-gradient-to-br from-blue-600 to-cyan-600"
              : "bg-gradient-to-br from-slate-400 to-slate-600"
          }`}
        >
          <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
            {unread ? (
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                New
              </span>
            ) : null}
            <span className="text-xs text-slate-500">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.body}</p>
          {item.deadlineAt ? (
            <p className="mt-2 text-xs text-slate-500">
              Return due: {formatDeadline(item.deadlineAt)}
            </p>
          ) : null}
          {item.receiptNumber ? (
            <p className="mt-1 font-mono text-xs text-slate-500">
              Receipt {item.receiptNumber}
            </p>
          ) : null}
          <Link
            href={href}
            onClick={() => void handleOpen()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300/50 bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm transition hover:border-blue-400 hover:bg-blue-50/80 sm:w-auto"
          >
            {linkLabel(item.type)}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProviderNotificationsPage() {
  const [items, setItems] = useState<NotificationDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markAllBusy, setMarkAllBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchMyNotifications({ limit: 50 });
      setItems(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = items?.filter((n) => !n.readAt).length ?? 0;

  async function handleMarkAllRead() {
    setMarkAllBusy(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ??
          null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark all as read.");
    } finally {
      setMarkAllBusy(false);
    }
  }

  function handleMarkRead(id: string) {
    setItems((prev) =>
      prev?.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
      ) ?? null,
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Alerts when your listings are sold or hired, plus reminders before customer return
            deadlines.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={markAllBusy}
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-300/50 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50/80 disabled:opacity-60"
          >
            {markAllBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Mark all as read
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-10">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" aria-label="Loading" />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : !items?.length ? (
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-blue-300/50 bg-white px-6 py-16 text-center shadow-sm">
          <Bell className="mx-auto h-10 w-10 text-blue-500/70" aria-hidden />
          <p className="mt-4 text-slate-600">
            No notifications yet. You will be notified when someone buys or hires your listings.
          </p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationCard item={item} onMarkRead={handleMarkRead} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
