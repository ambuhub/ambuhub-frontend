"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ScrollText,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  ADMIN_ACTIVITY_ACTIONS,
  fetchAdminActivityLogs,
  type AdminActivityAction,
  type AdminActivityLogListItem,
  type AdminActivitySort,
} from "@/lib/admin-activity-logs";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");

const ACTION_FILTERS: { id: AdminActivityAction | "all"; label: string }[] = [
  { id: "all", label: "All actions" },
  ...ADMIN_ACTIVITY_ACTIONS.map((action) => ({
    id: action,
    label: action
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  })),
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

function entityHref(log: AdminActivityLogListItem): string | null {
  if (!log.entityId) return null;
  if (log.entityType === "user") {
    return `/admin/users/${encodeURIComponent(log.entityId)}`;
  }
  if (log.entityType === "listing") {
    return `/admin/listings/${encodeURIComponent(log.entityId)}`;
  }
  if (log.entityType === "category") {
    return "/admin/categories";
  }
  return null;
}

function ActionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-900 ring-1 ring-indigo-200/80">
      {label}
    </span>
  );
}

export default function AdminActivityLogsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<AdminActivitySort>("newest");
  const [actionFilter, setActionFilter] = useState<AdminActivityAction | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AdminActivityLogListItem[]>([]);
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

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminActivityLogs({
        page,
        limit: PAGE_SIZE,
        from: fromDate || undefined,
        to: toDate || undefined,
        sort,
        action: actionFilter,
        q: debouncedSearch || undefined,
      });
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
      setError(
        err instanceof Error ? err.message : "Could not load activity logs.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, fromDate, toDate, sort, actionFilter, debouncedSearch]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Activity logs"
        description="Latest admin actions across users, team, categories, and listings. Filter by date range and sort by recency."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as AdminActivitySort);
                setPage(1);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Action</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(
                  e.target.value as AdminActivityAction | "all",
                );
                setPage(1);
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              {ACTION_FILTERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search summary, admin, or entity id"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {(fromDate || toDate || actionFilter !== "all" || searchInput) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setActionFilter("all");
                setSearchInput("");
                setDebouncedSearch("");
                setSort("newest");
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-indigo-600" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent activity
              </h2>
              <p className="text-xs text-slate-500">
                {loading
                  ? "Loading…"
                  : `Showing ${numberFmt.format(showingFrom)}–${numberFmt.format(showingTo)} of ${numberFmt.format(total)}`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="h-8 w-8 animate-spin text-indigo-600"
              aria-label="Loading activity logs"
            />
          </div>
        ) : error ? (
          <div className="px-5 py-8" role="alert">
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-slate-900">No activity yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Admin actions will appear here as they happen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    When
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Summary
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const href = entityHref(log);
                  return (
                    <tr
                      key={log.id}
                      className="border-t border-slate-100 hover:bg-indigo-50/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionBadge label={log.actionLabel} />
                      </td>
                      <td className="max-w-md px-4 py-3.5 text-slate-800">
                        <p className="line-clamp-2">{log.summary}</p>
                        {href ? (
                          <Link
                            href={href}
                            className="mt-1 inline-block text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                          >
                            View related
                          </Link>
                        ) : null}
                      </td>
                      <td className="hidden px-4 py-3.5 md:table-cell">
                        <p className="font-medium text-slate-900">
                          {log.actorName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.actorEmail}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
