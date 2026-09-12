"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminContactMessages,
  type AdminContactListItem,
  type AdminContactStatusCounts,
  type AdminContactStatusFilter,
} from "@/lib/admin-contact-messages";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");

const statusFilters: { id: AdminContactStatusFilter; label: string }[] = [
  { id: "all", label: "All messages" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
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

function countForStatus(
  counts: AdminContactStatusCounts | null,
  status: AdminContactStatusFilter,
): number | null {
  if (!counts) return null;
  return counts[status];
}

function MessageRow({ message }: { message: AdminContactListItem }) {
  const unread = message.status === "new";
  const weight = unread ? "font-bold" : "font-medium";
  const mutedWeight = unread ? "font-bold" : "font-normal";

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/contact-messages/${encodeURIComponent(message.id)}`}
          className="block min-w-0 hover:opacity-90"
        >
          <p className={`truncate text-slate-900 ${weight}`}>{message.name}</p>
          <p className={`truncate text-xs text-slate-500 ${mutedWeight}`}>
            {message.email}
          </p>
          {message.phone ? (
            <p className={`truncate text-xs text-slate-500 ${mutedWeight}`}>
              {message.phone}
            </p>
          ) : null}
        </Link>
      </td>
      <td
        className={`hidden px-4 py-3.5 text-sm text-slate-700 md:table-cell ${weight}`}
      >
        {message.subjectLabel}
      </td>
      <td className={`px-4 py-3.5 text-sm text-slate-700 ${weight}`}>
        {formatDateTime(message.createdAt)}
      </td>
      <td className="px-4 py-3.5 text-right">
        <Link
          href={`/admin/contact-messages/${encodeURIComponent(message.id)}`}
          className={`text-xs text-indigo-700 hover:text-indigo-900 ${unread ? "font-bold" : "font-semibold"}`}
        >
          View
        </Link>
      </td>
    </tr>
  );
}

export default function AdminContactMessagesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminContactStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<AdminContactListItem[]>([]);
  const [counts, setCounts] = useState<AdminContactStatusCounts | null>(null);
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

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminContactMessages({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter,
      });
      setMessages(data.messages);
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setMessages([]);
      setError(
        err instanceof Error ? err.message : "Could not load contact messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  function handleStatusChange(next: AdminContactStatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Contact messages"
        description="Messages submitted from the landing page and contact form."
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
              placeholder="Search by name, email, phone, subject, or message…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
            />
          </div>
          <p className="shrink-0 text-sm text-slate-600">
            {loading
              ? "Loading…"
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2
              className="h-8 w-8 animate-spin text-indigo-600"
              aria-hidden
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Mail className="h-10 w-10 text-slate-300" aria-hidden />
            <p className="text-sm font-medium text-slate-700">
              No contact messages found
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              When someone submits the contact form, it will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">From</th>
                  <th className="hidden px-4 py-3 md:table-cell">Subject</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
