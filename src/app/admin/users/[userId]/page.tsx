"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  applyAdminUserAction,
  fetchAdminUserDetail,
  type AdminUserAction,
  type AdminUserDetail,
} from "@/lib/admin-users";

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

function formatDate(iso: string): string {
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

function userDisplayName(user: AdminUserDetail): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email || "Unknown user";
}

function roleLabel(role: AdminUserDetail["role"]): string {
  if (role === "service_provider") return "Provider";
  if (role === "admin") return "Admin";
  return "Client";
}

type ActionButton = {
  action: AdminUserAction;
  label: string;
  icon: typeof ShieldCheck;
  tone: "primary" | "danger" | "neutral";
  confirm?: string;
};

function buildActions(user: AdminUserDetail): ActionButton[] {
  const actions: ActionButton[] = [];

  if (user.emailVerified) {
    actions.push({
      action: "unverify",
      label: "Mark unverified",
      icon: ShieldCheck,
      tone: "neutral",
      confirm: "Remove email verification for this user?",
    });
  } else {
    actions.push({
      action: "verify",
      label: "Verify email",
      icon: ShieldCheck,
      tone: "primary",
    });
  }

  if (user.isSuspended) {
    actions.push({
      action: "unsuspend",
      label: "Unsuspend",
      icon: Ban,
      tone: "primary",
    });
  } else {
    actions.push({
      action: "suspend",
      label: "Suspend",
      icon: Ban,
      tone: "danger",
      confirm: "Suspend this account? They will not be able to sign in.",
    });
  }

  if (user.role === "client") {
    actions.push({
      action: "promote_to_provider",
      label: "Promote to provider",
      icon: UserPlus,
      tone: "primary",
      confirm: "Promote this client to a service provider?",
    });
  }

  if (user.role === "service_provider") {
    actions.push({
      action: "demote_to_client",
      label: "Demote to client",
      icon: UserMinus,
      tone: "neutral",
      confirm: "Demote this provider to a client account?",
    });
  }

  return actions;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = typeof params.userId === "string" ? params.userId : "";

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<AdminUserAction | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUserDetail(userId);
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Could not load user.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  async function handleAction(action: ActionButton) {
    if (action.confirm && !window.confirm(action.confirm)) {
      return;
    }
    setActionLoading(action.action);
    setActionMessage(null);
    try {
      const updated = await applyAdminUserAction(userId, action.action);
      setUser(updated);
      setActionMessage(`${action.label} applied successfully.`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Could not apply action.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  const purchaseTotal = user?.transactions
    .filter((t) => t.direction === "purchase")
    .reduce((s, t) => s + t.subtotalNgn, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to users
      </Link>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : user ? (
        <>
          <AdminPageHeader
            theme="blue"
            title={userDisplayName(user)}
            description={`${roleLabel(user.role)} account · Joined ${formatDate(user.createdAt)}`}
          />

          {actionMessage ? (
            <p
              className={`rounded-xl border px-4 py-3 text-sm ${
                actionMessage.includes("successfully")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
              role="status"
            >
              {actionMessage}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Profile
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Email</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-900">
                    <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {user.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Phone</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-900">
                    <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                    {user.phone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Country</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {user.countryCode || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Date of birth
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {user.dateOfBirth ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Role</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {roleLabel(user.role)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.emailVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                    {user.isSuspended ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        Active
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {user.providerProfile ? (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Provider profile
                  </h3>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Business
                      </dt>
                      <dd className="mt-1 text-sm text-slate-900">
                        {user.providerProfile.businessName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Website
                      </dt>
                      <dd className="mt-1 text-sm text-slate-900">
                        {user.providerProfile.website ?? "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-slate-900">
                        {user.providerProfile.physicalAddress}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-sky-50/90 to-indigo-100/50 p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <UserCog className="h-4 w-4" aria-hidden />
                Account actions
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                {buildActions(user).map((action) => {
                  const Icon = action.icon;
                  const loadingThis = actionLoading === action.action;
                  const toneClass =
                    action.tone === "danger"
                      ? "border-red-200 bg-white text-red-800 hover:bg-red-50"
                      : action.tone === "primary"
                        ? "border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

                  return (
                    <button
                      key={action.action}
                      type="button"
                      disabled={actionLoading != null}
                      onClick={() => void handleAction(action)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${toneClass}`}
                    >
                      {loadingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Icon className="h-4 w-4" aria-hidden />
                      )}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" aria-hidden />
                  Transactions
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {user.transactions.length} order
                  {user.transactions.length === 1 ? "" : "s"}
                  {purchaseTotal != null && purchaseTotal > 0
                    ? ` · ${formatNgn(purchaseTotal)} total purchases`
                    : ""}
                </p>
              </div>
            </div>

            {user.transactions.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-slate-500">
                No transactions recorded for this user.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Receipt
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Paid
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Lines
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span className="sr-only">View receipt</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.transactions.map((tx) => (
                      <tr
                        key={`${tx.direction}-${tx.id}`}
                        className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/20"
                      >
                        <td className="px-5 py-3 font-mono text-sm text-slate-900">
                          {tx.receiptNumber}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              tx.direction === "purchase"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-violet-100 text-violet-800"
                            }`}
                          >
                            {tx.direction === "purchase" ? "Purchase" : "Sale"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                          {formatNgn(tx.subtotalNgn)}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">
                          {formatDateTime(tx.paidAt)}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">
                          {tx.lineCount}
                        </td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/receipts/${encodeURIComponent(tx.id)}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                          >
                            View
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
