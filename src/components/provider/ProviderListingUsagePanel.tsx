"use client";

import { AlertTriangle, Infinity as InfinityIcon, Layers } from "lucide-react";
import type { ProviderListingUsage } from "@/lib/provider-subscription";

function UsageBar({ count, limit }: { count: number; limit: number }) {
  const pct = limit <= 0 ? 0 : Math.min(100, Math.round((count / limit) * 100));
  const tone =
    pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-cyan-600";

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-valuenow={count}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-label={`${count} of ${limit} listings used`}
    >
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProviderListingUsagePanel({
  usage,
}: {
  usage: ProviderListingUsage | null;
}) {
  if (!usage) {
    return null;
  }

  const unlimited = usage.limitPerCategory === null;
  const anyAtLimit = usage.categories.some((c) => c.atLimit);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
          <Layers className="h-4 w-4 text-slate-500" aria-hidden />
          Your listing usage
        </h2>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            unlimited
              ? "bg-cyan-100 text-cyan-900"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {unlimited ? (
            <>
              <InfinityIcon className="h-3.5 w-3.5" aria-hidden />
              Unlimited
            </>
          ) : (
            `${usage.limitPerCategory} per category`
          )}
        </span>
      </div>

      <div className="p-5">
        {usage.categories.length === 0 ? (
          <p className="text-sm text-slate-500">
            You have no listings yet.{" "}
            {unlimited
              ? "Premium lets you publish as many as you like in every category."
              : `The Free plan allows ${usage.limitPerCategory} listings in each service category.`}
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {usage.categories.map((category) => (
                <li key={category.categoryId}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {category.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {unlimited ? (
                        <>
                          {category.count}{" "}
                          {category.count === 1 ? "listing" : "listings"}
                        </>
                      ) : (
                        <>
                          <span
                            className={
                              category.atLimit
                                ? "font-semibold text-red-700"
                                : "font-semibold text-slate-800"
                            }
                          >
                            {category.count}
                          </span>
                          <span className="text-slate-500">
                            {" "}
                            / {category.limit} used
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  {!unlimited && category.limit != null ? (
                    <div className="mt-1.5">
                      <UsageBar count={category.count} limit={category.limit} />
                      <p className="mt-1 text-xs text-slate-500">
                        {category.atLimit
                          ? "Category full — upgrade to Premium or remove a listing to add more."
                          : `${category.remaining} remaining in this category`}
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
              {usage.totalListings}{" "}
              {usage.totalListings === 1 ? "listing" : "listings"} across{" "}
              {usage.categories.length}{" "}
              {usage.categories.length === 1 ? "category" : "categories"}.
              {unlimited
                ? " Premium has no listing cap."
                : " Each service category has its own allowance."}
            </p>
          </>
        )}

        {anyAtLimit && !unlimited ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              One or more categories have reached the Free plan limit. Upgrading
              to Premium removes the cap in every category.
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
