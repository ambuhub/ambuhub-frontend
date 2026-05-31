export type ProviderPlanId = "free" | "premium" | "enterprise";

export type ProviderPlan = {
  id: ProviderPlanId;
  name: string;
  tagline: string;
  priceNgn: number | null;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
};

export const PROVIDER_PLANS: ProviderPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started on the marketplace",
    priceNgn: 0,
    priceNote: "Forever free",
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
    priceNgn: 25000,
    priceNote: "Per month, billed monthly",
    highlighted: true,
    features: [
      "Up to 15 active listings",
      "Premium badge on listings",
      "Priority placement in category browse",
      "Sales & booking analytics",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large operators & fleets",
    priceNgn: null,
    priceNote: "Custom pricing",
    features: [
      "Unlimited active listings",
      "Featured placement & campaigns",
      "Dedicated account manager",
      "Custom billing & invoicing",
      "SLA-backed support",
    ],
  },
];

export const DEFAULT_PROVIDER_PLAN: ProviderPlanId = "free";

export const PLAN_STORAGE_KEY = "ambuhub_provider_subscription_plan";

export function isProviderPlanId(value: unknown): value is ProviderPlanId {
  return value === "free" || value === "premium" || value === "enterprise";
}

export function getPlanById(id: ProviderPlanId): ProviderPlan {
  const plan = PROVIDER_PLANS.find((p) => p.id === id);
  if (!plan) {
    return PROVIDER_PLANS[0];
  }
  return plan;
}

export function formatPlanPrice(priceNgn: number | null): string {
  if (priceNgn === null) {
    return "Custom";
  }
  if (priceNgn === 0) {
    return "₦0";
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceNgn);
}
