"use client";

import Link from "next/link";
import { Bell, Crown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PROVIDER_SUBSCRIPTION_UPDATED_EVENT } from "@/components/provider/ProviderPremiumBadge";
import { fetchUnreadNotificationCount } from "@/lib/notifications";
import { fetchProviderSubscription } from "@/lib/provider-subscription";

export function ProviderDashboardUpgradeLink() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadSubscription = useCallback(async () => {
    try {
      const subscription = await fetchProviderSubscription();
      const isPremium =
        subscription.isActive && subscription.plan === "premium";
      setShowUpgrade(!isPremium);
    } catch {
      setShowUpgrade(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadSubscription();

    function onSubscriptionUpdated() {
      void loadSubscription();
    }

    window.addEventListener(
      PROVIDER_SUBSCRIPTION_UPDATED_EVENT,
      onSubscriptionUpdated,
    );
    return () => {
      window.removeEventListener(
        PROVIDER_SUBSCRIPTION_UPDATED_EVENT,
        onSubscriptionUpdated,
      );
    };
  }, [loadSubscription]);

  if (!loaded || !showUpgrade) {
    return null;
  }

  return (
    <Link
      href="/provider/subscription"
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 text-sm font-semibold text-amber-900 shadow-sm shadow-amber-200/50 transition hover:border-amber-400 hover:from-amber-100 hover:to-yellow-100"
    >
      <Crown className="h-4 w-4 text-amber-700" aria-hidden />
      Upgrade
    </Link>
  );
}

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
