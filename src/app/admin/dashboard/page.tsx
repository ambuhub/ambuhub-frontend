"use client";

import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  Loader2,
  Package,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  AdminPageHeader,
  AdminPlaceholderPanel,
} from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminDashboardStats,
  type AdminDashboardStats,
} from "@/lib/admin-stats";
import { fetchAuthMe } from "@/lib/marketplace-cart";
import { AdminMonthlyChartsRow } from "./AdminMonthlyChartsRow";

const numberFmt = new Intl.NumberFormat("en-NG");

const quickLinks = [
  { href: "/admin/users", label: "Manage users", icon: Users },
  { href: "/admin/orders", label: "View orders", icon: ShoppingBag },
  { href: "/admin/listings", label: "Moderate listings", icon: Package },
  { href: "/admin/categories", label: "Edit categories", icon: FolderTree },
] as const;

export default function AdminDashboardPage() {
  const [greetingName, setGreetingName] = useState("Admin");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (err) {
      setStats(null);
      setStatsError(
        err instanceof Error ? err.message : "Could not load dashboard stats.",
      );
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAuthMe()
      .then(({ user }) => {
        if (!cancelled && user?.firstName?.trim()) {
          setGreetingName(user.firstName.trim());
        }
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const hiddenListings =
    stats != null ? Math.max(0, stats.totalListings - stats.activeListings) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={`Welcome, ${greetingName}`}
        description={
          stats
            ? "Live platform metrics across users, listings, and orders."
            : "Platform overview and shortcuts for Ambuhub administration."
        }
      />

      {statsError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <span>{statsError}</span>
          <button
            type="button"
            onClick={() => void loadStats()}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total users"
          value={stats ? numberFmt.format(stats.totalUsers) : "—"}
          detail={
            stats
              ? `${numberFmt.format(stats.clientCount)} clients · ${numberFmt.format(stats.providerCount)} providers`
              : "Clients and providers"
          }
          icon={Users}
          cardClass="border-indigo-500/40 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-700 text-white shadow-lg shadow-indigo-900/40"
          iconClass="bg-indigo-500/25"
          loading={loadingStats}
          href="/admin/users"
        />
        <AdminStatCard
          label="Active listings"
          value={stats ? numberFmt.format(stats.activeListings) : "—"}
          detail={
            stats
              ? `${numberFmt.format(stats.totalListings)} total · ${numberFmt.format(hiddenListings)} hidden`
              : "Marketplace services"
          }
          icon={Package}
          cardClass="border-violet-500/40 bg-gradient-to-br from-violet-900 via-indigo-800 to-purple-700 text-white shadow-lg shadow-violet-900/40"
          iconClass="bg-violet-500/25"
          loading={loadingStats}
          href="/admin/listings"
        />
        <AdminStatCard
          label="Orders"
          value={stats ? numberFmt.format(stats.totalOrders) : "—"}
          detail={
            stats
              ? `${numberFmt.format(stats.ordersThisMonth)} this month`
              : "Platform-wide"
          }
          icon={ShoppingBag}
          cardClass="border-sky-500/40 bg-gradient-to-br from-sky-900 via-indigo-800 to-sky-700 text-white shadow-lg shadow-sky-900/40"
          iconClass="bg-sky-500/25"
          loading={loadingStats}
          href="/admin/orders"
        />
        <AdminStatCard
          label="Pending reviews"
          value="—"
          detail="Moderation queue"
          icon={Star}
          cardClass="border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900 via-indigo-800 to-fuchsia-700 text-white shadow-lg shadow-fuchsia-900/40"
          iconClass="bg-fuchsia-500/25"
          href="/admin/reviews"
        />
      </div>

      <div className="mt-2">
        <AdminMonthlyChartsRow />
      </div>

      {loadingStats ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-hidden />
          Loading platform metrics…
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Quick links</h2>
          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={loadingStats}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            Refresh metrics
          </button>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-900"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-600" aria-hidden />
                    {link.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <AdminPlaceholderPanel
        title="Coming next"
        description="User management, order audit, listing moderation, and category CMS will connect to this dashboard."
        features={[
          "Platform-wide user search, role changes, and account status",
          "Order and receipt audit across all clients and providers",
          "Listing moderation, availability overrides, and featured placement",
          "Service category CMS with protected create/update endpoints",
          "Review moderation and notification schedule oversight",
        ]}
      />
    </div>
  );
}
