"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import {
  formatMoney,
  type SupportedCurrency,
} from "@/lib/currency";
import { Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  ProviderCurrencyToggle,
  useProviderDashboardCurrency,
} from "./ProviderDashboardCurrency";

type WalletEntry = {
  currency: SupportedCurrency;
  balance: number;
};

type WalletsPayload = {
  wallets?: WalletEntry[];
  message?: string;
};

export function ProviderWalletBalance() {
  const { currency } = useProviderDashboardCurrency();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_PROXY_PREFIX}/wallet/me`, {
          credentials: "include",
        });
        const data = (await res.json()) as WalletsPayload;
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Sign in to view your wallet.");
          }
          if (res.status === 403) {
            throw new Error("Only service providers have a wallet.");
          }
          throw new Error(data.message ?? "Could not load wallet.");
        }
        if (!Array.isArray(data.wallets)) {
          throw new Error("Invalid wallet response.");
        }
        if (!cancelled) {
          setWallets(data.wallets);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load wallet.");
          setWallets([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const balance = useMemo(() => {
    const match = wallets.find((w) => w.currency === currency);
    return typeof match?.balance === "number" ? match.balance : 0;
  }, [wallets, currency]);

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-900 via-blue-800 to-cyan-700 p-4 text-white shadow-lg shadow-cyan-900/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-xs uppercase tracking-wide text-cyan-100/85">
          Wallet balance
        </p>
        <ProviderCurrencyToggle className="border-cyan-400/30 bg-cyan-950/30" />
      </div>
      <p className="mt-2 flex min-h-[1.75rem] items-center gap-2 text-xl font-bold text-white">
        <Wallet className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden />
        {loading ? (
          <span className="text-cyan-100/90">Loading…</span>
        ) : error ? (
          <span className="text-sm font-normal text-amber-100">{error}</span>
        ) : (
          formatMoney(balance, currency)
        )}
      </p>
      <p className="mt-1 text-sm text-cyan-100/85">
        Available balance ({currency})
      </p>
    </div>
  );
}
