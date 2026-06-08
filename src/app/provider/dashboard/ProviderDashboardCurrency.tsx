"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
} from "@/lib/currency";

type ProviderDashboardCurrencyContextValue = {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
};

const ProviderDashboardCurrencyContext =
  createContext<ProviderDashboardCurrencyContextValue | null>(null);

export function ProviderDashboardCurrencyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currency, setCurrency] = useState<SupportedCurrency>("NGN");
  return (
    <ProviderDashboardCurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </ProviderDashboardCurrencyContext.Provider>
  );
}

export function useProviderDashboardCurrency(): ProviderDashboardCurrencyContextValue {
  const ctx = useContext(ProviderDashboardCurrencyContext);
  if (!ctx) {
    throw new Error(
      "useProviderDashboardCurrency must be used within ProviderDashboardCurrencyProvider",
    );
  }
  return ctx;
}

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  NGN: "Naira",
  GHS: "Cedis",
};

export function ProviderCurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useProviderDashboardCurrency();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 ${className ?? ""}`}
      role="group"
      aria-label="Wallet currency"
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
            onClick={() => setCurrency(code)}
          >
            {CURRENCY_LABELS[code]} ({code})
          </button>
        );
      })}
    </div>
  );
}
