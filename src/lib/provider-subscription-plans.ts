import {
  formatMoney,
  type SupportedCurrency,
} from "@/lib/currency";

export type ProviderPlanId = "free" | "premium";

export type SubscriptionBillingInterval = "monthly" | "yearly";

export type ProviderPlan = {
  id: ProviderPlanId;
  name: string;
  tagline: string;
  prices: Record<
    SubscriptionBillingInterval,
    Record<SupportedCurrency, number>
  >;
  features: string[];
  highlighted?: boolean;
};

export const PREMIUM_SUBSCRIPTION_PRICES: ProviderPlan["prices"] = {
  monthly: { NGN: 10_000, GHS: 100 },
  yearly: { NGN: 100_000, GHS: 1_000 },
};

export const PROVIDER_PLANS: ProviderPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started on the marketplace",
    prices: {
      monthly: { NGN: 0, GHS: 0 },
      yearly: { NGN: 0, GHS: 0 },
    },
    features: [
      "Up to 3 active listings",
      "Sale, hire & booking checkout",
      "Standard search visibility",
      "Provider dashboard & wallet",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Grow visibility and capacity",
    prices: PREMIUM_SUBSCRIPTION_PRICES,
    highlighted: true,
    features: [
      "Up to 15 active listings",
      "Premium badge on listings",
      "Priority placement in category browse",
      "Sales & booking analytics",
      "Priority email support",
    ],
  },
];

export const DEFAULT_PROVIDER_PLAN: ProviderPlanId = "free";

export function isProviderPlanId(value: unknown): value is ProviderPlanId {
  return value === "free" || value === "premium";
}

export function isSubscriptionBillingInterval(
  value: unknown,
): value is SubscriptionBillingInterval {
  return value === "monthly" || value === "yearly";
}

export function getPlanById(id: ProviderPlanId): ProviderPlan {
  const plan = PROVIDER_PLANS.find((p) => p.id === id);
  if (!plan) {
    return PROVIDER_PLANS[0];
  }
  return plan;
}

export function getPlanPrice(
  plan: ProviderPlan,
  currency: SupportedCurrency,
  interval: SubscriptionBillingInterval,
): number {
  return plan.prices[interval][currency];
}

export function formatPlanPrice(
  amount: number,
  currency: SupportedCurrency,
): string {
  return formatMoney(amount, currency);
}

export function yearlySavingsPercent(currency: SupportedCurrency): number {
  const monthlyTotal = PREMIUM_SUBSCRIPTION_PRICES.monthly[currency] * 12;
  const yearlyTotal = PREMIUM_SUBSCRIPTION_PRICES.yearly[currency];
  if (monthlyTotal <= 0) {
    return 0;
  }
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}

export function billingIntervalLabel(interval: SubscriptionBillingInterval): string {
  return interval === "monthly" ? "month" : "year";
}
