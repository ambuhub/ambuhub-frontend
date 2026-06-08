"use client";

import type { AdminTransactionsMonthBucket } from "@/lib/admin-stats";
import { formatMoney, type SupportedCurrency } from "@/lib/currency";

type Props = {
  year: number;
  currency: SupportedCurrency;
  months: AdminTransactionsMonthBucket[];
  loading: boolean;
};

export function AdminMonthlyRevenueBarChart({
  year,
  currency,
  months,
  loading,
}: Props) {
  const rangeLabel = String(year);
  const maxTotal = Math.max(...months.map((m) => m.total), 0);
  const yearTotal = months.reduce((s, m) => s + m.total, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Platform revenue
        </h3>
        <span className="text-xs text-slate-500">
          Sales by order total ({currency})
        </span>
      </div>
      <div className="mt-4 h-52 rounded-xl bg-gradient-to-b from-indigo-50 via-white to-white p-4">
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
          <p className="text-sm text-slate-500">No chart data loaded.</p>
        ) : (
          <div className="flex h-full items-end gap-1 sm:gap-1.5">
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
                    className="w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-indigo-700 to-violet-400 transition-[height]"
                    style={{
                      height: `${heightPct}%`,
                      minHeight:
                        m.total > 0 ? "0.5rem" : maxTotal === 0 ? "0.35rem" : 0,
                    }}
                    title={`${m.label} ${rangeLabel}: ${formatMoney(m.total, currency)}`}
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
      {!loading && months.length > 0 ? (
        <p className="mt-3 text-center text-xs text-slate-600">
          {year} total ({currency}):{" "}
          <span className="font-semibold text-slate-800">
            {formatMoney(yearTotal, currency)}
          </span>
          {yearTotal === 0 ? (
            <span className="mt-1 block font-normal text-slate-500">
              No {currency} orders in this year (UTC).
            </span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
