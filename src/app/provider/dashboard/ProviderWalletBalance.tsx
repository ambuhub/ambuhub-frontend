"use client";

import { formatMoney } from "@/lib/currency";
import { fetchWalletBalances, type WalletBalance } from "@/lib/provider-wallet";
import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ProviderCurrencyToggle,
  useProviderDashboardCurrency,
} from "./ProviderDashboardCurrency";

export function ProviderWalletBalance() {
  const { currency } = useProviderDashboardCurrency();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchWalletBalances();
        if (!cancelled) {
          setWallets(list);
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
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-cyan-100/85">
          Available balance ({currency})
        </p>
        <Link
          href="/provider/wallet"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-cyan-100 underline-offset-2 transition hover:bg-white/10 hover:text-white hover:underline"
        >
          View history
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
