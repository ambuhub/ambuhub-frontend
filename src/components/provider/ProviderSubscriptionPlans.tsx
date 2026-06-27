"use client";

import { Check, Crown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { currencyForCountry } from "@/lib/currency";
import { runSubscriptionPaystackCheckout } from "@/lib/paystack-checkout";
import {
  billingIntervalLabel,
  formatPlanPrice,
  getPlanById,
  getPlanPrice,
  PROVIDER_PLANS,
  type ProviderPlanId,
  type SubscriptionBillingInterval,
  yearlySavingsPercent,
} from "@/lib/provider-subscription-plans";
import {
  fetchProviderSubscription,
  postPremiumSubscriptionInitialize,
  postPremiumSubscriptionVerify,
  type ProviderSubscriptionStatus,
} from "@/lib/provider-subscription";
import { PROVIDER_SUBSCRIPTION_UPDATED_EVENT } from "@/components/provider/ProviderPremiumBadge";

function planRank(id: ProviderPlanId): number {
  return id === "premium" ? 1 : 0;
}

function formatExpiryDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function ProviderSubscriptionPlans() {
  const { user, loading: sessionLoading } = useSessionAndCart();
  const currency = useMemo(
    () => currencyForCountry(user?.countryCode),
    [user?.countryCode],
  );
  const showPrices = !sessionLoading;

  const [billingInterval, setBillingInterval] =
    useState<SubscriptionBillingInterval>("monthly");
  const [subscription, setSubscription] = useState<ProviderSubscriptionStatus | null>(
    null,
  );
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [busyPlan, setBusyPlan] = useState<ProviderPlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    setLoadingSubscription(true);
    try {
      const data = await fetchProviderSubscription();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load subscription.");
    } finally {
      setLoadingSubscription(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  const currentPlanId: ProviderPlanId =
    subscription?.isActive && subscription.plan === "premium" ? "premium" : "free";
  const currentPlan = getPlanById(currentPlanId);
  const yearlySavings = yearlySavingsPercent(currency);

  async function handleSubscribePremium() {
    setError(null);
    setNotice(null);
    setBusyPlan("premium");

    try {
      const result = await runSubscriptionPaystackCheckout(
        () => postPremiumSubscriptionInitialize(billingInterval),
        postPremiumSubscriptionVerify,
      );
      setSubscription(result.subscription);
      setNotice(result.message);
      window.dispatchEvent(new Event(PROVIDER_SUBSCRIPTION_UPDATED_EVENT));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not complete checkout.";
      if (message !== "Payment window closed") {
        setError(message);
      }
    } finally {
      setBusyPlan(null);
    }
  }

  const currentPlanPrice =
    currentPlanId === "premium" && subscription?.interval
      ? getPlanPrice(currentPlan, currency, subscription.interval)
      : getPlanPrice(currentPlan, currency, billingInterval);

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
              ) : null}
              {loadingSubscription ? "…" : currentPlan.name}
            </p>
            {subscription?.isActive && subscription.expiresAt ? (
              <p className="text-xs text-slate-600">
                Renews through {formatExpiryDate(subscription.expiresAt)}
                {subscription.interval
                  ? ` (${subscription.interval === "monthly" ? "monthly" : "yearly"})`
                  : ""}
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                {showPrices && !loadingSubscription
                  ? `${formatPlanPrice(currentPlanPrice, currency)}${
                      currentPlanId === "premium" && subscription?.interval
                        ? ` / ${billingIntervalLabel(subscription.interval)}`
                        : ""
                    }`
                  : "—"}
              </p>
            )}
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

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
            role="group"
            aria-label="Billing interval"
          >
            <button
              type="button"
              onClick={() => setBillingInterval("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                billingInterval === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("yearly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                billingInterval === "yearly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly
              {yearlySavings > 0 ? (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  Save {yearlySavings}%
                </span>
              ) : null}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Premium pricing is shown in your account currency ({currency}).
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:mx-auto sm:max-w-3xl sm:grid-cols-2">
          {PROVIDER_PLANS.map((plan) => {
            const isCurrent = !loadingSubscription && plan.id === currentPlanId;
            const isUpgrade = planRank(plan.id) > planRank(currentPlanId);
            const busy = busyPlan === plan.id;
            const displayPrice = getPlanPrice(plan, currency, billingInterval);
            const priceSuffix =
              plan.id === "free"
                ? "Forever free"
                : billingInterval === "monthly"
                  ? "Per month, billed monthly"
                  : "Per year, billed annually";

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
                    {showPrices
                      ? formatPlanPrice(displayPrice, currency)
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{priceSuffix}</p>
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
                  {plan.id === "free" ? (
                    isCurrent ? (
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
                        disabled
                        className="inline-flex w-full cursor-default items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500"
                      >
                        Included when premium ends
                      </button>
                    )
                  ) : isCurrent ? (
                    <button
                      type="button"
                      disabled={loadingSubscription || busy}
                      onClick={() => void handleSubscribePremium()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-800 hover:to-cyan-700 disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      Extend premium
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingSubscription || busy}
                      onClick={() => void handleSubscribePremium()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-800 hover:to-cyan-700 disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      {isUpgrade ? "Subscribe to Premium" : "Select plan"}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ["Active listings", "Up to 3", "Up to 15"],
                  ["Premium listing badge", "—", "Yes"],
                  ["Priority browse placement", "—", "Yes"],
                  ["Analytics", "Basic", "Advanced"],
                  ["Support", "Email", "Priority email"],
                ].map(([feature, free, premium]) => (
                  <tr key={feature}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {feature}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{free}</td>
                    <td className="px-5 py-3.5 text-slate-600">{premium}</td>
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
