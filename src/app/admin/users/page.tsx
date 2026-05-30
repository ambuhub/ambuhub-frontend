"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminUsers,
  type AdminUserListItem,
  type AdminUsersRoleCounts,
  type AdminUsersRoleFilter,
} from "@/lib/admin-users";

const PAGE_SIZE = 20;
const numberFmt = new Intl.NumberFormat("en-NG");

const roleFilters: {
  id: AdminUsersRoleFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "client", label: "Clients" },
  { id: "service_provider", label: "Providers" },
  { id: "admin", label: "Admins" },
];

function formatJoined(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function roleLabel(role: AdminUserListItem["role"]): string {
  if (role === "service_provider") return "Provider";
  if (role === "admin") return "Admin";
  return "Client";
}

function userDisplayName(user: AdminUserListItem): string {
  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const name = `${first} ${last}`.trim();
  if (name) return name;
  return user.email?.split("@")[0] ?? "Unknown user";
}

function userInitials(user: AdminUserListItem): string {
  const first = user.firstName?.trim()?.charAt(0) ?? "";
  const last = user.lastName?.trim()?.charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  const emailInitial = user.email?.trim()?.charAt(0);
  return emailInitial ? emailInitial.toUpperCase() : "?";
}

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function RoleBadge({ role }: { role: AdminUserListItem["role"] }) {
  const styles =
    role === "admin"
      ? "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200/80"
      : role === "service_provider"
        ? "bg-violet-100 text-violet-800 ring-violet-200/80"
        : "bg-indigo-100 text-indigo-800 ring-indigo-200/80";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
      Verified
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
      Unverified
    </span>
  );
}

function UserRow({ user }: { user: AdminUserListItem }) {
  const fullName = userDisplayName(user);
  const initials = userInitials(user);

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30">
      <td className="px-4 py-3.5">
        <Link
          href={`/admin/users/${encodeURIComponent(user.id)}`}
          className="flex items-center gap-3 rounded-lg outline-none ring-indigo-500/0 transition hover:opacity-90 focus-visible:ring-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{fullName}</p>
            <p className="truncate text-xs text-slate-500">
              {displayOrDash(user.email)}
            </p>
          </div>
        </Link>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <div className="space-y-1 text-sm text-slate-700">
          <p className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span className="truncate">{displayOrDash(user.email)}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span>{displayOrDash(user.phone)}</span>
          </p>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap gap-1.5">
          <RoleBadge role={user.role} />
          {user.isSuspended ? (
            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
              Suspended
            </span>
          ) : null}
        </div>
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 lg:table-cell">
        {displayOrDash(user.countryCode)}
      </td>
      <td className="hidden px-4 py-3.5 text-sm text-slate-700 sm:table-cell">
        {formatJoined(user.createdAt)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <VerifiedBadge verified={user.emailVerified} />
          <Link
            href={`/admin/users/${encodeURIComponent(user.id)}`}
            className="hidden text-xs font-semibold text-indigo-700 hover:text-indigo-900 sm:inline"
          >
            View
          </Link>
        </div>
      </td>
    </tr>
  );
}

function countForRole(
  counts: AdminUsersRoleCounts | null,
  role: AdminUsersRoleFilter,
): number | null {
  if (!counts) return null;
  return counts[role];
}

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUsersRoleFilter>("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [counts, setCounts] = useState<AdminUsersRoleCounts | null>(null);
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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({
        page,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        role: roleFilter,
      });
      setUsers(data.users);
      setCounts(data.counts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function handleRoleChange(next: AdminUsersRoleFilter) {
    setRoleFilter(next);
    setPage(1);
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Users"
        description="Search and review client, provider, and admin accounts across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roleFilters.map((filter) => {
          const count = countForRole(counts, filter.id);
          const active = roleFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleRoleChange(filter.id)}
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
              id="admin-user-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email"
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
            onClick={() => void loadUsers()}
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
                  User
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                  Contact
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                  Country
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500">
                      <Users className="h-10 w-10 text-indigo-300" aria-hidden />
                      <p className="text-sm font-medium text-slate-700">
                        No users match your filters
                      </p>
                      <p className="text-xs">
                        Try a different search term or role filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => <UserRow key={user.id} user={user} />)
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
