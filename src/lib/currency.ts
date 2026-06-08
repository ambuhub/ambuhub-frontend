export const SUPPORTED_CURRENCIES = ["NGN", "GHS"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "NGN";

const LOCALE_BY_CURRENCY: Record<SupportedCurrency, string> = {
  NGN: "en-NG",
  GHS: "en-GH",
};

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function parseSupportedCurrency(
  value: string | null | undefined,
  fallback: SupportedCurrency = DEFAULT_CURRENCY,
): SupportedCurrency {
  const upper = value?.trim().toUpperCase();
  if (upper && isSupportedCurrency(upper)) {
    return upper;
  }
  return fallback;
}

export function currencyForCountry(countryCode: string | null | undefined): SupportedCurrency {
  const code = countryCode?.trim().toUpperCase() ?? "";
  if (code === "GH") {
    return "GHS";
  }
  return "NGN";
}

export function formatMoney(
  amount: number,
  currency: SupportedCurrency,
): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: SupportedCurrency): string {
  const parts = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  const symbol = parts.find((p) => p.type === "currency")?.value;
  return symbol?.trim() || currency;
}
