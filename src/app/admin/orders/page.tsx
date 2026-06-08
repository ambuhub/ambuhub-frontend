"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShoppingBag,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminOrders,
  type AdminOrderKindCounts,
  type AdminOrderKindFilter,
  type AdminOrderListItem,
} from "@/lib/admin-orders";
import { formatMoney, parseSupportedCurrency } from "@/lib/currency";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");

const kindFilters: { id: AdminOrderKindFilter; label: string }[] = [
  { id: "all", label: "All orders" },
  { id: "sale", label: "Sales" },
  { id: "hire", label: "Hires" },
  { id: "book", label: "Bookings" },
];

function formatOrderAmount(amount: number, currency: string): string {
  return formatMoney(amount, parseSupportedCurrency(currency));
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function buyerName(buyer: AdminOrderListItem["buyer"]): string {
  const name = `${buyer.firstName} ${buyer.lastName}`.trim();
  return name || buyer.email || "Unknown buyer";
}

function kindLabel(kind: AdminOrderListItem["primaryLineKind"]): string {
  if (kind === "mixed") return "Mixed";
  if (kind === "hire") return "Hire";
  if (kind === "book") return "Book";
  return "Sale";
}

function KindBadge({ kind }: { kind: AdminOrderListItem["primaryLineKind"] }) {
  const styles =
    kind === "hire"
      ? "bg-amber-100 text-amber-900 ring-amber-200/80"
      : kind === "book"
        ? "bg-sky-100 text-sky-900 ring-sky-200/80"
        : kind === "mixed"
          ? "bg-slate-100 text-slate-800 ring-slate-200/80"
          : "bg-indigo-100 text-indigo-800 ring-indigo-200/80";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles}`}
    >
      {kindLabel(kind)}
    </span>
  );
}

function countForKind(
  counts: AdminOrderKindCounts | null,
  kind: AdminOrderKindFilter,
): number | null {
  if (!counts) return null;
  return counts[kind];
}

function OrderRow({ order }: { order: AdminOrderListItem }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/orders/${encodeURIComponent(order.id)}`}
          className="font-mono text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          {order.receiptNumber}
        </Link>
      </td>
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/users/${encodeURIComponent(order.buyer.id)}`}
          className="block min-w-0 hover:opacity-90"
        >
          <p className="truncate font-medium text-slate-900">
            {buyerName(order.buyer)}
          </p>
          <p className="truncate text-xs text-slate-500">{order.buyer.email}</p>
        </Link>
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 md:table-cell">
        {order.sellerSummary}
      </td>
      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
        {formatOrderAmount(order.subtotal, order.currency)}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 sm:table-cell">
        {formatDateTime(order.paidAt)}
      </td>
      <td className="px-4 py-3.5">
        <KindBadge kind={order.primaryLineKind} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <Link
          href={`/admin/orders/${encodeURIComponent(order.id)}`}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

export default function AdminOrdersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<AdminOrderKindFilter>("all");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [counts, setCounts] = useState<AdminOrderKindCounts | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        kind: kindFilter,
      });
      setOrders(data.orders);
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, kindFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  function handleKindChange(next: AdminOrderKindFilter) {
    setKindFilter(next);
    setPage(1);
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Orders"
        description="Monitor sales, hires, and bookings across the entire marketplace."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kindFilters.map((filter) => {
          const count = countForKind(counts, filter.id);
          const active = kindFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleKindChange(filter.id)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                active
                  ? "border-indigo-300 bg-gradient-to-br from-indigo-600 to-violet-700 text-white ring-2 ring-indigo-300/50"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  active ? "text-indigo-100" : "text-slate-500"
                }`}
              >
                {filter.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {count != null ? numberFmt.format(count) : "—"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-sky-50/90 to-indigo-100/50 p-4 shadow-sm shadow-indigo-900/5 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600"
              aria-hidden
            />
            <input
              id="admin-order-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search receipt or buyer name/email"
              className="w-full rounded-xl border border-indigo-300/90 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm shadow-indigo-900/10 outline-none ring-1 ring-indigo-100 transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <p className="text-sm text-indigo-800/80">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-indigo-950">
                  {numberFmt.format(showingFrom)}–{numberFmt.format(showingTo)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-indigo-950">
                  {numberFmt.format(total)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Receipt
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Buyer
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Seller
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Paid
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-3 w-full max-w-md animate-pulse rounded bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500">
                      <ShoppingBag
                        className="h-10 w-10 text-indigo-300"
                        aria-hidden
                      />
                      <p className="text-sm font-medium text-slate-700">
                        No orders match your filters
                      </p>
                      <p className="text-xs">
                        Try a different search term or order type.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-600">
              Page{" "}
              <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
