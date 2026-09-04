import { API_PROXY_PREFIX } from "@/lib/api";
import type { SupportedCurrency } from "@/lib/currency";
import type { PaginationMeta } from "@/lib/paginate";

/** Mirrors [walletLedgerEntry.model.ts](ambuhub-backend/src/models/walletLedgerEntry.model.ts). */
export const WALLET_LEDGER_ENTRY_TYPES = [
  "sale_payout",
  "hire_payout",
  "book_payout",
  "dispatch_payout",
  "reversal",
  "adjustment",
] as const;

export type WalletLedgerEntryType = (typeof WALLET_LEDGER_ENTRY_TYPES)[number];

export type WalletLedgerDirection = "credit" | "debit";
export type WalletLedgerStatus = "pending" | "posted" | "reversed";

export type WalletLedgerEntry = {
  id: string;
  currency: SupportedCurrency;
  direction: WalletLedgerDirection;
  entryType: WalletLedgerEntryType;
  entryTypeLabel: string;
  status: WalletLedgerStatus;
  amount: number;
  signedAmount: number;
  balanceAfter: number | null;
  description: string;
  orderId: string | null;
  serviceId: string | null;
  dispatchRequestId: string | null;
  receiptNumber: string | null;
  reversalOfEntryId: string | null;
  /** When the money moved. Use this for display and ordering. */
  occurredAt: string;
  /** When the row was written. Differs from `occurredAt` for backfilled entries. */
  createdAt: string;
};

export type WalletLedgerResult = {
  entries: WalletLedgerEntry[];
} & PaginationMeta;

export type WalletBalance = {
  currency: SupportedCurrency;
  balance: number;
};

export type WalletLedgerCurrencySummary = {
  currency: SupportedCurrency;
  balance: number;
  ledgerBalance: number;
  reconciled: boolean;
  totalCredited: number;
  totalDebited: number;
  entryCount: number;
  pendingCount: number;
  lastEntryAt: string | null;
};

export type WalletLedgerSort = "newest" | "oldest";

export type FetchWalletLedgerParams = {
  page?: number;
  limit?: number;
  currency?: SupportedCurrency | "all";
  entryType?: WalletLedgerEntryType | "all";
  sort?: WalletLedgerSort;
};

export const WALLET_LEDGER_TYPE_LABELS: Record<WalletLedgerEntryType, string> = {
  sale_payout: "Sale payout",
  hire_payout: "Hire payout",
  book_payout: "Booking payout",
  dispatch_payout: "Dispatch payout",
  reversal: "Reversal",
  adjustment: "Adjustment",
};

function walletError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in to view your wallet.");
  }
  if (res.status === 403) {
    return new Error("Only service providers have a wallet.");
  }
  return new Error(data.message ?? "Could not load wallet.");
}

export async function fetchWalletBalances(): Promise<WalletBalance[]> {
  const res = await fetch(`${API_PROXY_PREFIX}/wallet/me`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    wallets?: WalletBalance[];
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.wallets)) {
    throw walletError(res, data);
  }
  return data.wallets;
}

export async function fetchWalletLedger(
  params: FetchWalletLedgerParams = {},
): Promise<WalletLedgerResult> {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.currency && params.currency !== "all") {
    search.set("currency", params.currency);
  }
  if (params.entryType && params.entryType !== "all") {
    search.set("entryType", params.entryType);
  }
  if (params.sort) search.set("sort", params.sort);

  const qs = search.toString();
  const res = await fetch(
    `${API_PROXY_PREFIX}/wallet/me/ledger${qs ? `?${qs}` : ""}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as WalletLedgerResult & { message?: string };

  if (!res.ok || !Array.isArray(data.entries)) {
    throw walletError(res, data);
  }
  return data;
}

export async function fetchWalletSummary(): Promise<
  WalletLedgerCurrencySummary[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/wallet/me/summary`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    summary?: WalletLedgerCurrencySummary[];
    message?: string;
  };

  if (!res.ok || !Array.isArray(data.summary)) {
    throw walletError(res, data);
  }
  return data.summary;
}

export function formatLedgerTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
