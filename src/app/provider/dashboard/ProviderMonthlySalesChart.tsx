"use client";

import { useCallback, useEffect, useState } from "react";
import { API_PROXY_PREFIX } from "@/lib/api";
import {
  formatMoney,
  type SupportedCurrency,
} from "@/lib/currency";
import {
  useProviderDashboardCurrency,
} from "./ProviderDashboardCurrency";

type MonthBucket = {
  yearMonth: string;
  label: string;
  total: number;
};

function formatCompact(amount: number, currency: SupportedCurrency): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

function defaultChartYear(): number {
  return new Date().getUTCFullYear();
}

export function ProviderMonthlySalesChart() {
  const { currency } = useProviderDashboardCurrency();
  const [year, setYear] = useState(defaultChartYear);
  const [months, setMonths] = useState<MonthBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (y: number, chartCurrency: SupportedCurrency) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: String(y),
        currency: chartCurrency,
      });
      const res = await fetch(
        `${API_PROXY_PREFIX}/orders/provider/sales-by-month?${params.toString()}`,
        { credentials: "include" },
      );
      const data = (await res.json()) as {
        year?: number;
        currency?: SupportedCurrency;
        months?: MonthBucket[];
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message ?? "Could not load sales.");
      }
      if (!Array.isArray(data.months)) {
        throw new Error("Invalid sales response.");
      }
      setMonths(data.months);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sales.");
      setMonths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(year, currency);
  }, [year, currency, load]);

  const rangeLabel = String(year);

  const maxTotal = Math.max(...months.map((m) => m.total), 0);
  const yearTotal = months.reduce((s, m) => s + m.total, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Monthly performance
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">
            Sales from your listings ({currency})
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Previous year"
            >
              Prev
            </button>
            <span className="min-w-[3rem] text-center text-xs font-semibold tabular-nums text-slate-800">
              {rangeLabel}
            </span>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Next year"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 h-44 rounded-xl bg-gradient-to-b from-cyan-50 via-white to-white p-4">
        {loading ? (
          <div className="flex h-full items-end gap-1.5 sm:gap-2">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-1 animate-pulse rounded-t-md bg-slate-200"
                style={{ height: "40%" }}
              />
            ))}
          </div>
        ) : months.length === 0 ? (
          <p className="text-sm text-slate-500">
            No chart data loaded. Check that you are signed in as a service provider.
          </p>
        ) : (
          <>
            <div className="flex h-full min-h-[7rem] items-end gap-1 sm:gap-1.5">
              {months.map((m) => {
                let heightPct =
                  maxTotal > 0 ? Math.round((m.total / maxTotal) * 100) : 0;
                if (maxTotal === 0) {
                  heightPct = 8;
                } else if (heightPct > 0 && heightPct < 12) {
                  heightPct = 12;
                }
                return (
                  <div
                    key={m.yearMonth}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-[height]"
                      style={{
                        height: `${heightPct}%`,
                        minHeight:
                          m.total > 0 ? "0.5rem" : maxTotal === 0 ? "0.35rem" : 0,
                      }}
                      title={`${m.label} ${rangeLabel}: ${formatCompact(m.total, currency)}`}
                    />
                    <span className="w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-slate-600">
              {year} total ({currency}):{" "}
              <span className="font-semibold text-slate-800">
                {formatMoney(yearTotal, currency)}
              </span>
              {yearTotal === 0 ? (
                <span className="mt-1 block font-normal text-slate-500">
                  No qualifying {currency} orders in this year. Use Prev/Next if your
                  sales are dated in another year (UTC).
                </span>
              ) : null}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
