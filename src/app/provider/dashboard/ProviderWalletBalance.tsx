"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type WalletPayload = {
  wallet?: { balanceNgn: number; currency: string };
  message?: string;
};

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProviderWalletBalance() {
  const [balance, setBalance] = useState<number | null>(null);
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
        const data = (await res.json()) as WalletPayload;
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Sign in to view your wallet.");
          }
          if (res.status === 403) {
            throw new Error("Only service providers have a wallet.");
          }
          throw new Error(data.message ?? "Could not load wallet.");
        }
        if (typeof data.wallet?.balanceNgn !== "number") {
          throw new Error("Invalid wallet response.");
        }
        if (!cancelled) {
          setBalance(data.wallet.balanceNgn);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load wallet.");
          setBalance(null);
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

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-900 via-blue-800 to-cyan-700 p-4 text-white shadow-lg shadow-cyan-900/40">
      <p className="text-xs uppercase tracking-wide text-cyan-100/85">
        Wallet balance
      </p>
      <p className="mt-2 flex min-h-[1.75rem] items-center gap-2 text-xl font-bold text-white">
        <Wallet className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden />
        {loading ? (
          <span className="text-cyan-100/90">Loading…</span>
        ) : error ? (
          <span className="text-sm font-normal text-amber-100">{error}</span>
        ) : (
          formatNgn(balance ?? 0)
        )}
      </p>
      <p className="mt-1 text-sm text-cyan-100/85">Available balance</p>
    </div>
  );
}
