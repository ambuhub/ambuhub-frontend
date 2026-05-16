"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUnreadNotificationCount } from "@/lib/notifications";

export function ProviderDashboardBellLink() {
  return (
    <Link
      href="/provider/notifications"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
    </Link>
  );
}

export function ProviderUnreadNotificationsMetric({
  cardClass,
}: {
  cardClass: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await fetchUnreadNotificationCount();
        if (!cancelled) {
          setCount(n);
        }
      } catch {
        if (!cancelled) {
          setCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = count === null ? "—" : String(count);

  return (
    <Link href="/provider/notifications" className={`block rounded-2xl p-4 ${cardClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-white/80">
        Unread notifications
      </p>
      <p className="mt-2 text-3xl font-bold">{display}</p>
      <p className="mt-1 text-xs text-white/70">Sales, hires, and return reminders</p>
    </Link>
  );
}
