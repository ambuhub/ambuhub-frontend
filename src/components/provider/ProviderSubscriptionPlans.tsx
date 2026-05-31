"use client";

import Link from "next/link";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PROVIDER_PLAN,
  formatPlanPrice,
  getPlanById,
  isProviderPlanId,
  PLAN_STORAGE_KEY,
  PROVIDER_PLANS,
  type ProviderPlanId,
} from "@/lib/provider-subscription-plans";

function planRank(id: ProviderPlanId): number {
  if (id === "free") return 0;
  if (id === "premium") return 1;
  return 2;
}

export function ProviderSubscriptionPlans() {
  const [currentPlanId, setCurrentPlanId] =
    useState<ProviderPlanId>(DEFAULT_PROVIDER_PLAN);
  const [hydrated, setHydrated] = useState(false);
  const [busyPlan, setBusyPlan] = useState<ProviderPlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLAN_STORAGE_KEY);
      if (stored && isProviderPlanId(stored)) {
        setCurrentPlanId(stored);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persistPlan = useCallback((planId: ProviderPlanId) => {
    setCurrentPlanId(planId);
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, planId);
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSelectPlan(targetId: ProviderPlanId) {
    setError(null);
    setNotice(null);

    if (targetId === currentPlanId) {
      return;
    }

    if (targetId === "enterprise") {
      return;
    }

    setBusyPlan(targetId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (targetId === "premium") {
        persistPlan("premium");
        setNotice(
          "Premium activated (simulated). Paystack billing will connect here in a future release.",
        );
        return;
      }

      if (targetId === "free") {
        persistPlan("free");
        setNotice("You are now on the Free plan.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update plan.");
    } finally {
      setBusyPlan(null);
    }
  }

  const currentPlan = getPlanById(currentPlanId);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[26px] border border-blue-100/80 bg-white/95 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Subscription
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Choose the plan that fits your listings, bookings, and growth goals.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-cyan-50/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800/80">
              Current plan
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-lg font-bold text-slate-900">
              {currentPlanId === "premium" ? (
                <Crown className="h-5 w-5 text-amber-500" aria-hidden />
              ) : currentPlanId === "enterprise" ? (
                <Sparkles className="h-5 w-5 text-violet-500" aria-hidden />
              ) : null}
              {hydrated ? currentPlan.name : "…"}
            </p>
            <p className="text-xs text-slate-600">
              {hydrated ? formatPlanPrice(currentPlan.priceNgn) : "—"}
              {currentPlan.priceNgn !== null && currentPlan.priceNgn > 0
                ? " / month"
                : currentPlan.priceNgn === null
                  ? ""
                  : ""}
            </p>
          </div>
        </div>

        {notice ? (
          <p
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            {notice}
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-xs text-slate-500">
          Paystack subscription billing is not connected yet. Plan changes below run
          as a temporary simulation stored on this device.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PROVIDER_PLANS.map((plan) => {
            const isCurrent = hydrated && plan.id === currentPlanId;
            const isUpgrade = planRank(plan.id) > planRank(currentPlanId);
            const isDowngrade = planRank(plan.id) < planRank(currentPlanId);
            const busy = busyPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-lg transition ${
                  plan.highlighted
                    ? "border-cyan-300/80 shadow-cyan-900/10 ring-2 ring-cyan-400/30 lg:-mt-1 lg:mb-1"
                    : "border-slate-200/90 shadow-slate-200/50"
                } ${isCurrent ? "ring-2 ring-blue-500/40" : ""}`}
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-700 to-cyan-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                    Most popular
                  </span>
                ) : null}
                {isCurrent ? (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                    Current
                  </span>
                ) : null}

                <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{plan.tagline}</p>

                <div className="mt-5">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatPlanPrice(plan.priceNgn)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{plan.priceNote}</p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.id === "enterprise" ? (
                    <Link
                      href="/#contact"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Contact sales
                    </Link>
                  ) : isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full cursor-default items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"
                    >
                      Current plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!hydrated || busy || busyPlan !== null}
                      onClick={() => void handleSelectPlan(plan.id)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700"
                          : "bg-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      {isUpgrade
                        ? plan.id === "premium"
                          ? "Upgrade (simulated)"
                          : "Select plan"
                        : isDowngrade
                          ? "Switch to Free"
                          : "Select plan"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Compare plans
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Feature</th>
                  <th className="px-5 py-3">Free</th>
                  <th className="px-5 py-3">Premium</th>
                  <th className="px-5 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Active listings", "Up to 3", "Up to 15", "Unlimited"],
                  ["Premium listing badge", "—", "Yes", "Yes"],
                  ["Priority browse placement", "—", "Yes", "Featured"],
                  ["Analytics", "Basic", "Advanced", "Advanced + exports"],
                  ["Support", "Email", "Priority email", "Dedicated manager"],
                ].map(([feature, free, premium, enterprise]) => (
                  <tr key={feature}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {feature}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{free}</td>
                    <td className="px-5 py-3.5 text-slate-600">{premium}</td>
                    <td className="px-5 py-3.5 text-slate-600">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
