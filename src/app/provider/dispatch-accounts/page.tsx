"use client";

import { Loader2, UserPlus } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MARKETPLACE_COUNTRIES } from "@/lib/countries";
import {
  createDispatchAccount,
  fetchAvailableDispatchListings,
  fetchDispatchAccounts,
  setDispatchAccountDisabled,
  type AvailableDispatchListing,
  type DispatchAccountDto,
} from "@/lib/provider-dispatch-accounts";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function ProviderDispatchAccountsPage() {
  const [accounts, setAccounts] = useState<DispatchAccountDto[]>([]);
  const [listings, setListings] = useState<AvailableDispatchListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [password, setPassword] = useState("");
  const [serviceId, setServiceId] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextAccounts, nextListings] = await Promise.all([
        fetchDispatchAccounts(),
        fetchAvailableDispatchListings(),
      ]);
      setAccounts(nextAccounts);
      setListings(nextListings);
      setError(null);
      setServiceId((prev) =>
        prev && nextListings.some((l) => l.id === prev)
          ? prev
          : (nextListings[0]?.id ?? ""),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await createDispatchAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        countryCode,
        password,
        serviceId,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not create account",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleDisabled(account: DispatchAccountDto) {
    setTogglingId(account.id);
    setError(null);
    try {
      const updated = await setDispatchAccountDisabled(
        account.id,
        !account.isDisabled,
      );
      setAccounts((list) =>
        list.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update account");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
            <UserPlus className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Create Dispatch
            </h1>
            <p className="text-sm text-slate-600">
              Create crew logins linked to ground ambulance listings. Only those
              accounts can go on duty.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          New dispatch account
        </h2>
        {listings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No unlinked ground ambulance listings. Add a listing or unlink an
            existing one before creating another account.
          </p>
        ) : (
          <form onSubmit={(e) => void handleCreate(e)} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dispatch-first-name" className={labelClass}>
                  First name
                </label>
                <input
                  id="dispatch-first-name"
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="dispatch-last-name" className={labelClass}>
                  Last name
                </label>
                <input
                  id="dispatch-last-name"
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="dispatch-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="dispatch-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="dispatch-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="dispatch-phone"
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="dispatch-country" className={labelClass}>
                  Country
                </label>
                <CountrySelect
                  id="dispatch-country"
                  value={countryCode}
                  onChange={setCountryCode}
                  countries={MARKETPLACE_COUNTRIES}
                  required
                />
              </div>
              <div>
                <label htmlFor="dispatch-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="dispatch-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="dispatch-service" className={labelClass}>
                  Ground ambulance listing
                </label>
                <select
                  id="dispatch-service"
                  className={inputClass}
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !serviceId}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Create account
            </button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dispatch accounts
        </h2>
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
            No dispatch accounts yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Crew</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Duty</th>
                  <th className="px-4 py-3">Active request</th>
                  <th className="px-4 py-3">Last outcome</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {account.firstName} {account.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{account.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {account.listingTitle}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          account.dispatchEnabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {account.dispatchEnabled ? "On duty" : "Off duty"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {account.activeRequestStatus ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {account.lastAttemptOutcome ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={togglingId === account.id}
                        onClick={() => void handleToggleDisabled(account)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                          account.isDisabled
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {togglingId === account.id ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden
                          />
                        ) : account.isDisabled ? (
                          "Enable"
                        ) : (
                          "Disable"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
