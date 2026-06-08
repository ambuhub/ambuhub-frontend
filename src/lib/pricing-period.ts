/** Hire and book listings bill by the day only. */
export const LISTING_PRICING_PERIOD = "daily" as const;

export const PRICING_PERIODS = [LISTING_PRICING_PERIOD] as const;

export type PricingPeriod = (typeof PRICING_PERIODS)[number];

const LEGACY_PERIOD_LABELS: Record<string, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const LEGACY_PERIOD_SUFFIXES: Record<string, string> = {
  hourly: "per hour",
  daily: "per day",
  weekly: "per week",
  monthly: "per month",
  yearly: "per year",
};

export function isPricingPeriod(value: string): value is PricingPeriod {
  return value === LISTING_PRICING_PERIOD;
}

/** Normalize hire/book listing period to daily (legacy rows may store other values). */
export function listingPricingPeriod(
  value: string | null | undefined,
): PricingPeriod {
  return LISTING_PRICING_PERIOD;
}

export function formatPricingPeriodLabel(
  period: PricingPeriod | string | null | undefined,
): string {
  if (!period) return "";
  return LEGACY_PERIOD_LABELS[period] ?? "Daily";
}

/** Short suffix for displayed hire/book prices, e.g. "per day". */
export function formatHirePricePeriodSuffix(
  period: PricingPeriod | string | null | undefined,
): string {
  if (!period) return "";
  return LEGACY_PERIOD_SUFFIXES[period] ?? "per day";
}
