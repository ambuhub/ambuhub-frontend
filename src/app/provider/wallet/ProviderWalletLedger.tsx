"use client";

import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  SUPPORTED_CURRENCIES,
  formatMoney,
  type SupportedCurrency,
} from "@/lib/currency";
import { Pagination } from "@/components/ui/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  WALLET_LEDGER_ENTRY_TYPES,
  WALLET_LEDGER_TYPE_LABELS,
  fetchWalletLedger,
  fetchWalletSummary,
  formatLedgerTimestamp,
  type WalletLedgerCurrencySummary,
  type WalletLedgerEntry,
  type WalletLedgerEntryType,
  type WalletLedgerSort,
} from "@/lib/provider-wallet";

const PAGE_SIZE = 20;

function StatusBadge({ entry }: { entry: WalletLedgerEntry }) {
  if (entry.status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        <AlertTriangle className="h-3 w-3" aria-hidden />
        Unconfirmed
      </span>
    );
  }
  if (entry.status === "reversed") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
        Reversed
      </span>
    );
  }
  return null;
}

function SummaryCard({ summary }: { summary: WalletLedgerCurrencySummary }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {summary.currency} balance
        </p>
        <Wallet className="h-4 w-4 text-slate-400" aria-hidden />
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {formatMoney(summary.balance, summary.currency)}
      </p>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Credited</dt>
          <dd className="font-medium text-emerald-700">
            {formatMoney(summary.totalCredited, summary.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Reversed</dt>
          <dd className="font-medium text-slate-700">
            {formatMoney(summary.totalDebited, summary.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Entries</dt>
          <dd className="font-medium text-slate-700">{summary.entryCount}</dd>
        </div>
      </dl>

      {!summary.reconciled ? (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Ledger totals {formatMoney(summary.ledgerBalance, summary.currency)}
            , which does not match this balance. Contact support so it can be
            reconciled.
          </span>
        </p>
      ) : summary.pendingCount > 0 ? (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {summary.pendingCount} unconfirmed{" "}
            {summary.pendingCount === 1 ? "entry" : "entries"} awaiting
            reconciliation.
          </span>
        </p>
      ) : null}
    </article>
  );
}

export function ProviderWalletLedger() {
  const [summary, setSummary] = useState<WalletLedgerCurrencySummary[]>([]);

  const [currency, setCurrency] = useState<SupportedCurrency | "all">("all");
  const [entryType, setEntryType] = useState<WalletLedgerEntryType | "all">(
    "all",
  );
  const [sort, setSort] = useState<WalletLedgerSort>("newest");


  const loadSummary = useCallback(async () => {
    try {
      setSummary(await fetchWalletSummary());
    } catch {
      // The ledger table below surfaces the failure; a missing summary should
      // not blank the whole page.
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const fetchPage = useCallback(
    async (page: number, limit: number) => {
      const result = await fetchWalletLedger({
        page,
        limit,
        currency,
        entryType,
        sort,
      });
      return { items: result.entries, meta: result };
    },
    [currency, entryType, sort],
  );

  const {
    items: entries,
    meta,
    loading,
    loadingMore,
    error,
    loadMore,
    goToPage,
  } = usePaginatedList<WalletLedgerEntry>(fetchPage, {
    limit: PAGE_SIZE,
    // Restart at page 1 whenever a filter changes.
    resetKey: `${currency}|${entryType}|${sort}`,
  });


  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Wallet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every payout and correction on your wallet, newest first. Balances are
          credited when a customer&apos;s payment is confirmed.
        </p>
      </header>

      <section
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Wallet balances by currency"
      >
        {summary.length > 0
          ? summary.map((row) => (
              <SummaryCard key={row.currency} summary={row} />
            ))
          : SUPPORTED_CURRENCIES.map((code) => (
              <div
                key={code}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
              />
            ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4">
          <div>
            <label
              htmlFor="ledger-currency"
              className="block text-xs font-medium text-slate-600"
            >
              Currency
            </label>
            <select
              id="ledger-currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as SupportedCurrency | "all");
              }}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40"
            >
              <option value="all">All currencies</option>
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ledger-type"
              className="block text-xs font-medium text-slate-600"
            >
              Type
            </label>
            <select
              id="ledger-type"
              value={entryType}
              onChange={(e) => {
                setEntryType(e.target.value as WalletLedgerEntryType | "all");
              }}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40"
            >
              <option value="all">All types</option>
              {WALLET_LEDGER_ENTRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {WALLET_LEDGER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ledger-sort"
              className="block text-xs font-medium text-slate-600"
            >
              Order
            </label>
            <select
              id="ledger-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as WalletLedgerSort);
              }}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <p className="ml-auto text-sm text-slate-500">
            {meta.total} {meta.total === 1 ? "entry" : "entries"}
          </p>
        </div>

        {error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading ledger…
          </p>
        ) : entries.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No wallet activity yet. Payouts appear here once a customer&apos;s
            payment for one of your listings is confirmed.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Balance after
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const isCredit = entry.direction === "credit";
                  return (
                    <tr key={entry.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatLedgerTimestamp(entry.occurredAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {entry.description}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{entry.entryTypeLabel}</span>
                          <StatusBadge entry={entry} />
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {entry.receiptNumber ?? (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                          isCredit ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {isCredit ? (
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <ArrowDownLeft
                              className="h-3.5 w-3.5"
                              aria-hidden
                            />
                          )}
                          {isCredit ? "+" : "−"}
                          {formatMoney(entry.amount, entry.currency)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                        {entry.balanceAfter != null ? (
                          formatMoney(entry.balanceAfter, entry.currency)
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 pb-4">
          <Pagination
            meta={meta}
            shownCount={entries.length}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            onGoToPage={goToPage}
            itemNoun="entries"
            className="mt-0 border-t-0 pt-0"
          />
        </div>
      </section>
    </div>
  );
}
