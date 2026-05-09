"use client";

import { useCallback, useEffect, useState } from "react";
import { API_PROXY_PREFIX } from "@/lib/api";

type MonthBucket = {
  yearMonth: string;
  label: string;
  totalNgn: number;
};

function formatNgnCompact(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function defaultChartYear(): number {
  return new Date().getUTCFullYear();
}

export function ProviderMonthlySalesChart() {
  const [year, setYear] = useState(defaultChartYear);
  const [months, setMonths] = useState<MonthBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (y: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ year: String(y) });
      const res = await fetch(
        `${API_PROXY_PREFIX}/orders/provider/sales-by-month?${params.toString()}`,
        { credentials: "include" },
      );
      const data = (await res.json()) as {
        year?: number;
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
    void load(year);
  }, [year, load]);

  const rangeLabel = String(year);

  const maxNgn = Math.max(...months.map((m) => m.totalNgn), 0);
  const yearTotalNgn = months.reduce((s, m) => s + m.totalNgn, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Monthly performance
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Sales by order total (NGN)</span>
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
                  maxNgn > 0 ? Math.round((m.totalNgn / maxNgn) * 100) : 0;
                if (maxNgn === 0) {
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
                          m.totalNgn > 0 ? "0.5rem" : maxNgn === 0 ? "0.35rem" : 0,
                      }}
                      title={`${m.label} ${rangeLabel}: ${formatNgnCompact(m.totalNgn)}`}
                    />
                    <span className="w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-slate-600">
              {year} total:{" "}
              <span className="font-semibold text-slate-800">
                {formatNgnCompact(yearTotalNgn)}
              </span>
              {yearTotalNgn === 0 ? (
                <span className="mt-1 block font-normal text-slate-500">
                  No qualifying orders in this year. Use Prev/Next if your sales
                  are dated in another year (UTC). Orders must include your
                  listing (seller id or active service row).
                </span>
              ) : null}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
