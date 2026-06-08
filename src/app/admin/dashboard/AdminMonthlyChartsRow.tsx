"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminTransactionsByMonth,
  type AdminTransactionsMonthBucket,
} from "@/lib/admin-stats";
import type { SupportedCurrency } from "@/lib/currency";
import { AdminCurrencyToggle } from "./AdminDashboardCurrency";
import { AdminMonthlyRevenueBarChart } from "./AdminMonthlyRevenueBarChart";
import { AdminMonthlyTransactionCountPieChart } from "./AdminMonthlyTransactionCountPieChart";

function defaultChartYear(): number {
  return new Date().getUTCFullYear();
}

export function AdminMonthlyChartsRow() {
  const [year, setYear] = useState(defaultChartYear);
  const [currency, setCurrency] = useState<SupportedCurrency>("NGN");
  const [months, setMonths] = useState<AdminTransactionsMonthBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (y: number, chartCurrency: SupportedCurrency) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTransactionsByMonth(y, chartCurrency);
      setMonths(data.months);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load transactions.",
      );
      setMonths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(year, currency);
  }, [year, currency, load]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Monthly platform activity
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Revenue and order counts by calendar month ({currency}, UTC)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminCurrencyToggle currency={currency} onChange={setCurrency} />
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Previous year"
            >
              Prev
            </button>
            <span className="min-w-[3rem] text-center text-xs font-semibold tabular-nums text-slate-800">
              {year}
            </span>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Next year"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminMonthlyRevenueBarChart
          year={year}
          currency={currency}
          months={months}
          loading={loading}
        />
        <AdminMonthlyTransactionCountPieChart
          year={year}
          currency={currency}
          months={months}
          loading={loading}
        />
      </div>
    </section>
  );
}
