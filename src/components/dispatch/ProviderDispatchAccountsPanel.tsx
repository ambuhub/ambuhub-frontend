"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MARKETPLACE_COUNTRIES } from "@/lib/countries";
import {
  createDispatchAccount,
  fetchAvailableDispatchListings,
  type AvailableDispatchListing,
} from "@/lib/provider-dispatch-accounts";
import { currencyForCountry, getCurrencySymbol } from "@/lib/currency";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export function ProviderDispatchAccountsPanel() {
  const [listings, setListings] = useState<AvailableDispatchListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [password, setPassword] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [dispatchIsFree, setDispatchIsFree] = useState(true);
  const [dispatchPrice, setDispatchPrice] = useState("");

  const load = useCallback(async () => {
    try {
      const nextListings = await fetchAvailableDispatchListings();
      setListings(nextListings);
      setError(null);
      setServiceId((prev) =>
        prev && nextListings.some((l) => l.id === prev)
          ? prev
          : (nextListings[0]?.id ?? ""),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load listings");
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
    setCreated(false);
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
        dispatchIsFree,
        dispatchPrice: dispatchIsFree ? null : Number(dispatchPrice),
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setCreated(true);
      await load();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not create account",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Create a crew login linked to one ground ambulance listing. Only that
        account can go on duty for the listing.
      </p>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {created && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Dispatch account created. Open the{" "}
          <Link
            href="/provider/dispatch?tab=accounts"
            className="font-semibold underline"
          >
            Dispatch accounts
          </Link>{" "}
          tab to view it.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          New dispatch account
        </h2>
        {listings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No unlinked ground ambulance listings. Add a listing before creating
            another account.
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
              <div className="sm:col-span-2">
                <p className={labelClass}>Dispatch trip fee</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dispatchIsFree}
                      onChange={() => setDispatchIsFree(true)}
                    />
                    Free
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!dispatchIsFree}
                      onChange={() => setDispatchIsFree(false)}
                    />
                    Paid
                  </label>
                </div>
                {!dispatchIsFree && (
                  <div className="mt-3">
                    <label htmlFor="dispatch-price" className={labelClass}>
                      Price (
                      {getCurrencySymbol(
                        currencyForCountry(
                          listings.find((l) => l.id === serviceId)?.countryCode,
                        ),
                      )}
                      )
                    </label>
                    <input
                      id="dispatch-price"
                      type="number"
                      min={1}
                      className={inputClass}
                      value={dispatchPrice}
                      onChange={(e) => setDispatchPrice(e.target.value)}
                      required={!dispatchIsFree}
                    />
                  </div>
                )}
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
    </div>
  );
}
