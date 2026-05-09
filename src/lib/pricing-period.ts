export const PRICING_PERIODS = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;

export type PricingPeriod = (typeof PRICING_PERIODS)[number];

export function isPricingPeriod(value: string): value is PricingPeriod {
  return (PRICING_PERIODS as readonly string[]).includes(value);
}

export function formatPricingPeriodLabel(
  period: PricingPeriod | null | undefined,
): string {
  if (!period) return "";
  const labels: Record<PricingPeriod, string> = {
    hourly: "Hourly",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };
  return labels[period];
}

/** Short suffix for displayed hire prices, e.g. "per day". */
export function formatHirePricePeriodSuffix(
  period: PricingPeriod | null | undefined,
): string {
  if (!period) return "";
  const suffixes: Record<PricingPeriod, string> = {
    hourly: "per hour",
    daily: "per day",
    weekly: "per week",
    monthly: "per month",
    yearly: "per year",
  };
  return suffixes[period];
}
