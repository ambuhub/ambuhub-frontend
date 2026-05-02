"use client";

import { useEffect, useState } from "react";
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

export function ProviderMonthlySalesChart() {
  const [months, setMonths] = useState<MonthBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_PROXY_PREFIX}/orders/provider/sales-by-month`,
          { credentials: "include" },
        );
        const data = (await res.json()) as {
          months?: MonthBucket[];
          message?: string;
        };
        if (!res.ok) {
          throw new Error(data.message ?? "Could not load sales.");
        }
        if (!Array.isArray(data.months)) {
          throw new Error("Invalid sales response.");
        }
        if (!cancelled) {
          setMonths(data.months);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load sales.");
          setMonths([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rangeLabel =
    months.length > 0
      ? `${months[0]?.label} – ${months[months.length - 1]?.label}`
      : "Last 8 months";

  const maxNgn = Math.max(...months.map((m) => m.totalNgn), 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Monthly performance
        </h2>
        <span className="text-right text-xs text-slate-500">{rangeLabel}</span>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 h-44 rounded-xl bg-gradient-to-b from-cyan-50 via-white to-white p-4">
        {loading ? (
          <div className="flex h-full items-end gap-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-1 animate-pulse rounded-t-md bg-slate-200"
                style={{ height: "40%" }}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-end gap-1.5 sm:gap-2">
            {months.map((m) => {
              let heightPct =
                maxNgn > 0 ? Math.round((m.totalNgn / maxNgn) * 100) : 0;
              if (maxNgn === 0) {
                heightPct = 8;
              } else if (heightPct > 0 && heightPct < 6) {
                heightPct = 6;
              }
              return (
                <div
                  key={m.yearMonth}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-[height]"
                    style={{ height: `${heightPct}%` }}
                    title={`${m.label}: ${formatNgnCompact(m.totalNgn)}`}
                  />
                  <span className="w-full truncate text-center text-[10px] font-medium text-slate-500 sm:text-xs">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
