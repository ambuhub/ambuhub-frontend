import { API_PROXY_PREFIX } from "@/lib/api";
import type { SupportedCurrency } from "@/lib/currency";

export type AdminDashboardStats = {
  totalUsers: number;
  clientCount: number;
  providerCount: number;
  activeListings: number;
  totalListings: number;
  totalOrders: number;
  ordersThisMonth: number;
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/stats`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    stats?: AdminDashboardStats;
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in as an admin to view dashboard stats.");
  }
  if (res.status === 403) {
    throw new Error("Admin access required.");
  }
  if (!res.ok || !data.stats) {
    throw new Error(data.message ?? "Could not load dashboard stats.");
  }
  return data.stats;
}

export type AdminTransactionsMonthBucket = {
  yearMonth: string;
  label: string;
  total: number;
  orderCount: number;
};

export async function fetchAdminTransactionsByMonth(
  year: number,
  currency: SupportedCurrency,
): Promise<{ year: number; currency: SupportedCurrency; months: AdminTransactionsMonthBucket[] }> {
  const params = new URLSearchParams({
    year: String(year),
    currency,
  });
  const res = await fetch(
    `${API_PROXY_PREFIX}/admin/transactions-by-month?${params.toString()}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    year?: number;
    currency?: SupportedCurrency;
    months?: AdminTransactionsMonthBucket[];
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in as an admin to view transactions.");
  }
  if (res.status === 403) {
    throw new Error("Admin access required.");
  }
  if (!res.ok || !Array.isArray(data.months)) {
    throw new Error(data.message ?? "Could not load transactions by month.");
  }
  return {
    year: typeof data.year === "number" ? data.year : year,
    currency: data.currency ?? currency,
    months: data.months,
  };
}
