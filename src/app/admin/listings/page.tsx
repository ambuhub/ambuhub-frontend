"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminListings,
  patchAdminListingAvailability,
  type AdminListingListItem,
  type AdminListingStatusCounts,
  type AdminListingStatusFilter,
  type AdminListingTypeFilter,
} from "@/lib/admin-listings";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");
const currencyFmt = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statusFilters: { id: AdminListingStatusFilter; label: string }[] = [
  { id: "all", label: "All listings" },
  { id: "live", label: "Live" },
  { id: "taken_down", label: "Taken down" },
];

const typeFilters: { id: AdminListingTypeFilter; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "sale", label: "Sale" },
  { id: "hire", label: "Hire" },
  { id: "book", label: "Personnel" },
];

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

function listingTypeLabel(type: AdminListingListItem["listingType"]): string {
  if (type === "sale") return "Sale";
  if (type === "hire") return "Hire";
  if (type === "book") return "Personnel";
  return "—";
}

function countForStatus(
  counts: AdminListingStatusCounts | null,
  status: AdminListingStatusFilter,
): number | null {
  if (!counts) return null;
  return counts[status];
}

function LiveStatusBadge({ isLive }: { isLive: boolean }) {
  if (isLive) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-900 ring-1 ring-rose-200/80">
      Taken down
    </span>
  );
}

function TypeBadge({ type }: { type: AdminListingListItem["listingType"] }) {
  const styles =
    type === "sale"
      ? "bg-amber-100 text-amber-900 ring-amber-200/80"
      : type === "hire"
        ? "bg-sky-100 text-sky-900 ring-sky-200/80"
        : type === "book"
          ? "bg-violet-100 text-violet-900 ring-violet-200/80"
          : "bg-slate-100 text-slate-700 ring-slate-200/80";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles}`}
    >
      {listingTypeLabel(type)}
    </span>
  );
}

function providerLabel(listing: AdminListingListItem): string {
  if (listing.businessName?.trim()) return listing.businessName.trim();
  return listing.providerName;
}

type ListingRowProps = {
  listing: AdminListingListItem;
  actionLoading: boolean;
  onAvailabilityChange: (
    listing: AdminListingListItem,
    isAvailable: boolean,
  ) => void;
};

function ListingRow({
  listing,
  actionLoading,
  onAvailabilityChange,
}: ListingRowProps) {
  const detailHref = `/admin/listings/${encodeURIComponent(listing.id)}`;

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
      <td className="px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{listing.title}</p>
          <p className="truncate text-xs text-slate-500">
            {listing.categoryName} · {listing.departmentName}
          </p>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <Link
          href={`/admin/users/${encodeURIComponent(listing.providerUserId)}`}
          className="block min-w-0 hover:opacity-90"
        >
          <p className="truncate text-sm font-medium text-slate-900">
            {providerLabel(listing)}
          </p>
          <p className="truncate text-xs text-slate-500">
            {listing.providerEmail || "—"}
          </p>
        </Link>
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <TypeBadge type={listing.listingType} />
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 xl:table-cell">
        {listing.listingType === "sale" && listing.price != null
          ? currencyFmt.format(listing.price)
          : listing.listingType === "sale"
            ? "—"
            : listing.price != null
              ? currencyFmt.format(listing.price)
              : "—"}
      </td>
      <td className="px-4 py-3.5">
        <LiveStatusBadge isLive={listing.isLive} />
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 sm:table-cell">
        {formatDateTime(listing.updatedAt)}
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex flex-col items-end gap-1.5">
          <Link
            href={detailHref}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View
          </Link>
          {listing.isLive ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                if (
                  window.confirm(
                    "Take down this listing? It will be hidden from the marketplace until restored.",
                  )
                ) {
                  onAvailabilityChange(listing, false);
                }
              }}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Take down"}
            </button>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onAvailabilityChange(listing, true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
            >
              {actionLoading ? "Updating…" : "Restore"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminListingsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminListingStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<AdminListingTypeFilter>("all");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<AdminListingListItem[]>([]);
  const [counts, setCounts] = useState<AdminListingStatusCounts | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionListingId, setActionListingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminListings({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter,
        listingType: typeFilter,
      });
      setListings(data.listings);
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setListings([]);
      setError(err instanceof Error ? err.message : "Could not load listings.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  async function handleAvailabilityChange(
    listing: AdminListingListItem,
    isAvailable: boolean,
  ) {
    setActionListingId(listing.id);
    setActionMessage(null);
    try {
      const updated = await patchAdminListingAvailability(
        listing.id,
        isAvailable,
      );
      setListings((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      setActionMessage(
        isAvailable
          ? `"${listing.title}" is live on the marketplace again.`
          : `"${listing.title}" has been taken down.`,
      );
      const data = await fetchAdminListings({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter,
        listingType: typeFilter,
      });
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setListings(data.listings);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Could not update listing.",
      );
    } finally {
      setActionListingId(null);
    }
  }

  function handleStatusChange(next: AdminListingStatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  function handleTypeChange(next: AdminListingTypeFilter) {
    setTypeFilter(next);
    setPage(1);
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Listings"
        description="Browse all marketplace listings. Providers publish directly—use this page to take down listings that violate policy or restore them later."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {statusFilters.map((filter) => {
          const count = countForStatus(counts, filter.id);
          const active = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleStatusChange(filter.id)}
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, provider name, business, or email…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => {
              const active = typeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => handleTypeChange(filter.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {total === 0
            ? "No listings"
            : `Showing ${showingFrom}–${showingTo} of ${numberFmt.format(total)}`}
        </p>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Package className="h-5 w-5 text-indigo-600" aria-hidden />
            Marketplace listings
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
          </div>
        ) : listings.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-500">
            No listings match your filters yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Listing
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Provider
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                    Type
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 xl:table-cell">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    actionLoading={actionListingId === listing.id}
                    onAvailabilityChange={handleAvailabilityChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
