"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchAdminUnreadNotificationCount } from "@/lib/admin-notifications";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-events";

export function AdminNotificationBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const n = await fetchAdminUnreadNotificationCount();
        if (!cancelled) {
          setCount(n);
        }
      } catch {
        if (!cancelled) {
          setCount(0);
        }
      }
    }

    void load();

    function onUpdated() {
      void load();
    }
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdated);
    };
  }, [pathname]);

  if (count <= 0) {
    return null;
  }

  const label = count > 9 ? "9+" : String(count);

  return (
    <span
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-400 px-1.5 text-[10px] font-bold text-indigo-950 shadow-[0_0_10px_rgba(129,140,248,0.6)]"
      aria-label={`${count} unread notifications`}
    >
      {label}
    </span>
  );
}
