"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchUnreadNotificationCount } from "@/lib/notifications";

export function ClientNotificationBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

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
  }, [pathname]);

  if (count <= 0) {
    return null;
  }

  const label = count > 9 ? "9+" : String(count);

  return (
    <span
      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
      aria-label={`${count} unread notifications`}
    >
      {label}
    </span>
  );
}
