"use client";

import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/lib/currency";

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  NGN: "Naira",
  GHS: "Cedis",
};

type Props = {
  currency: SupportedCurrency;
  onChange: (currency: SupportedCurrency) => void;
  className?: string;
};

export function AdminCurrencyToggle({ currency, onChange, className }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 ${className ?? ""}`}
      role="group"
      aria-label="Chart currency"
    >
      {SUPPORTED_CURRENCIES.map((code) => {
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
            }`}
            onClick={() => onChange(code)}
          >
            {CURRENCY_LABELS[code]} ({code})
          </button>
        );
      })}
    </div>
  );
}
