"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  Loader2,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminConciergeRequests,
  type AdminConciergeListItem,
  type AdminConciergeStatusCounts,
  type AdminConciergeStatusFilter,
} from "@/lib/admin-concierge";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");

const statusFilters: { id: AdminConciergeStatusFilter; label: string }[] = [
  { id: "all", label: "All requests" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "resolved", label: "Resolved" },
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

function statusLabel(status: AdminConciergeListItem["status"]): string {
  if (status === "in_progress") return "In progress";
  if (status === "resolved") return "Resolved";
  return "Pending";
}

function StatusBadge({ status }: { status: AdminConciergeListItem["status"] }) {
  const styles =
    status === "resolved"
      ? "bg-emerald-100 text-emerald-900 ring-emerald-200/80"
      : status === "in_progress"
        ? "bg-sky-100 text-sky-900 ring-sky-200/80"
        : "bg-amber-100 text-amber-900 ring-amber-200/80";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function countForStatus(
  counts: AdminConciergeStatusCounts | null,
  status: AdminConciergeStatusFilter,
): number | null {
  if (!counts) return null;
  return counts[status];
}

function RequestRow({ request }: { request: AdminConciergeListItem }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/concierge-requests/${encodeURIComponent(request.id)}`}
          className="block min-w-0 hover:opacity-90"
        >
          <p className="truncate font-medium text-slate-900">{request.name}</p>
          <p className="truncate text-xs text-slate-500">{request.email}</p>
        </Link>
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 md:table-cell">
        {request.categoryName}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 lg:table-cell">
        {request.departmentName}
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-700">
        {formatDateTime(request.createdAt)}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={request.status} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <Link
          href={`/admin/concierge-requests/${encodeURIComponent(request.id)}`}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

export default function AdminConciergeRequestsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminConciergeStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<AdminConciergeListItem[]>([]);
  const [counts, setCounts] = useState<AdminConciergeStatusCounts | null>(null);
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

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminConciergeRequests({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter,
      });
      setRequests(data.requests);
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setRequests([]);
      setError(
        err instanceof Error ? err.message : "Could not load concierge requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  function handleStatusChange(next: AdminConciergeStatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Concierge requests"
        description="Review and manage custom service requests submitted through the client concierge desk."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, category, or description…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
            />
          </div>
          <p className="shrink-0 text-sm text-slate-600">
            {total === 0
              ? "No requests"
              : `Showing ${showingFrom}–${showingTo} of ${numberFmt.format(total)}`}
          </p>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <ConciergeBell className="h-5 w-5 text-indigo-600" aria-hidden />
            Incoming requests
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
          </div>
        ) : requests.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-500">
            No concierge requests match your filters yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                    Department
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <RequestRow key={request.id} request={request} />
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
