"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Shield,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { createAdminTeamMember } from "@/lib/admin-team";
import {
  fetchAdminUsers,
  type AdminUserListItem,
} from "@/lib/admin-users";
import { getCountryNameByCode } from "@/lib/countries";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

const labelClass = "block text-sm font-medium text-slate-700";

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

function displayName(user: AdminUserListItem): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

function initials(user: AdminUserListItem): string {
  const first = user.firstName?.trim()?.charAt(0) ?? "";
  const last = user.lastName?.trim()?.charAt(0) ?? "";
  const value = `${first}${last}`.toUpperCase();
  if (value) return value;
  return (user.email?.charAt(0) ?? "?").toUpperCase();
}

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("ng");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchAdminUsers({
        role: "admin",
        page: 1,
        limit: 100,
      });
      setAdmins(data.users);
      setTotal(data.total);
    } catch (err) {
      setAdmins([]);
      setTotal(0);
      setListError(
        err instanceof Error ? err.message : "Could not load admin team.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!firstName.trim() || !lastName.trim()) {
      setFormError("First and last name are required.");
      return;
    }
    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!countryCode.trim()) {
      setFormError("Please select a country.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAdminTeamMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        countryCode: countryCode.trim(),
        password,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setFormSuccess(`${displayName(created)} was added as an admin.`);
      await loadAdmins();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not create admin.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        theme="blue"
        title="Team"
        description="Create admin accounts and see who currently has access to the admin dashboard."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" aria-hidden />
            <h2 className="text-base font-semibold text-slate-900">
              Add admin
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            New admins can sign in immediately with the email and password you
            set.
          </p>

          <form className="mt-5 space-y-3.5" onSubmit={(e) => void handleCreate(e)}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="team-first-name" className={labelClass}>
                  First name
                </label>
                <input
                  id="team-first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="team-last-name" className={labelClass}>
                  Last name
                </label>
                <input
                  id="team-last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="team-email" className={labelClass}>
                Email
              </label>
              <input
                id="team-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="team-phone" className={labelClass}>
                Phone number
              </label>
              <input
                id="team-phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="team-country" className={labelClass}>
                Country
              </label>
              <CountrySelect
                id="team-country"
                value={countryCode}
                onChange={setCountryCode}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="team-password" className={labelClass}>
                Password
              </label>
              <input
                id="team-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                At least 8 characters.
              </p>
            </div>

            <div>
              <label htmlFor="team-confirm-password" className={labelClass}>
                Confirm password
              </label>
              <input
                id="team-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={fieldClass}
              />
            </div>

            {formError ? (
              <p className="text-sm text-red-700" role="alert">
                {formError}
              </p>
            ) : null}
            {formSuccess ? (
              <div
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-900"
                role="status"
              >
                <p className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  {formSuccess}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Shield className="h-4 w-4" aria-hidden />
              )}
              Create admin
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-indigo-600" aria-hidden />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Admin team
                </h2>
                <p className="text-sm text-slate-500">
                  {loading ? "Loading…" : `${total} admin${total === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="h-8 w-8 animate-spin text-indigo-600"
                aria-label="Loading admins"
              />
            </div>
          ) : listError ? (
            <div className="px-5 py-8" role="alert">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {listError}
              </p>
            </div>
          ) : admins.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-slate-900">
                No admins found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create the first admin account using the form.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {admins.map((admin) => {
                const country =
                  getCountryNameByCode(admin.countryCode) ?? admin.countryCode;
                return (
                  <li
                    key={admin.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-800">
                        {initials(admin)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {displayName(admin)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {admin.email}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {admin.phone || "—"}
                          {country ? ` · ${country}` : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <span className="inline-flex rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-800 ring-1 ring-fuchsia-200/80">
                        Admin
                      </span>
                      <span className="text-xs text-slate-500">
                        Joined {formatJoined(admin.createdAt)}
                      </span>
                      <Link
                        href={`/admin/users/${encodeURIComponent(admin.id)}`}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                      >
                        View profile
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
