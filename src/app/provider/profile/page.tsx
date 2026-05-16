"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CheckCircle2, Loader2, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import type { PublicAuthUser } from "@/lib/auth-redirect";
import { postChangePassword } from "@/lib/client-profile";
import { getCountryNameByCode } from "@/lib/countries";
import { fetchAuthMe } from "@/lib/marketplace-cart";
import { patchProviderProfile } from "@/lib/provider-profile";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

const labelClass = "block text-sm font-medium text-slate-700";

const sectionClass =
  "relative overflow-hidden rounded-2xl border border-blue-200/60 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6";

const accentBarClass =
  "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-500";

function userToForm(user: PublicAuthUser) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode.trim().toLowerCase(),
    businessName: user.businessName ?? "",
    website: user.website ?? "",
    physicalAddress: user.physicalAddress ?? "",
  };
}

export default function ProviderProfilePage() {
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/provider/profile")}`;
  const { refresh } = useSessionAndCart();

  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { user: u, ok } = await fetchAuthMe();
      if (!ok || !u) {
        setUser(null);
        setLoadError("Sign in to view and edit your business profile.");
        return;
      }
      setUser(u);
      const form = userToForm(u);
      setFirstName(form.firstName);
      setLastName(form.lastName);
      setPhone(form.phone);
      setCountryCode(form.countryCode);
      setBusinessName(form.businessName);
      setWebsite(form.website);
      setPhysicalAddress(form.physicalAddress);
    } catch {
      setLoadError("Could not load profile.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileNotice(null);
    if (!countryCode.trim()) {
      setProfileError("Please select a country.");
      return;
    }
    if (!businessName.trim() || !physicalAddress.trim()) {
      setProfileError("Business name and physical address are required.");
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await patchProviderProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        countryCode: countryCode.trim(),
        businessName: businessName.trim(),
        physicalAddress: physicalAddress.trim(),
        website: website.trim() || undefined,
      });
      setUser(updated);
      const form = userToForm(updated);
      setFirstName(form.firstName);
      setLastName(form.lastName);
      setPhone(form.phone);
      setCountryCode(form.countryCode);
      setBusinessName(form.businessName);
      setWebsite(form.website);
      setPhysicalAddress(form.physicalAddress);
      await refresh();
      setProfileNotice("Profile saved.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await postChangePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated successfully.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Could not change password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  const countryDisplayName = countryCode
    ? getCountryNameByCode(countryCode) ?? user?.countryCode
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          <Building2 className="h-8 w-8 text-blue-600 sm:h-9 sm:w-9" aria-hidden />
          Business profile
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your contact details and business information used when customers view your
          listings.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" aria-label="Loading" />
        </div>
      ) : loadError ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {loadError}
          </div>
          <Link
            href={loginHref}
            className="inline-flex rounded-lg border border-blue-300/50 bg-white px-3 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
          >
            Go to sign in
          </Link>
        </div>
      ) : user?.role === "client" || user?.role === "patient" ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          You are signed in as a client. Personal profile editing is on the{" "}
          <Link href="/client/profile" className="font-semibold underline">
            client profile
          </Link>{" "}
          page.
        </div>
      ) : user?.role !== "service_provider" ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          This page is for service provider accounts.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section className={sectionClass}>
            <div className={accentBarClass} aria-hidden />
            <h2 className="text-lg font-semibold text-slate-900">Contact person</h2>
            <p className="mt-1 text-sm text-slate-600">
              Primary contact for your business on Ambuhub.
            </p>
            <form className="relative mt-5 space-y-4" onSubmit={(e) => void handleSaveProfile(e)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="provider-first-name" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="provider-first-name"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="provider-last-name" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="provider-last-name"
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
                <label htmlFor="provider-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="provider-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="provider-country" className={labelClass}>
                  Country
                </label>
                <CountrySelect
                  id="provider-country"
                  value={countryCode}
                  onChange={setCountryCode}
                  required
                  className="mt-1.5"
                />
                {countryDisplayName ? (
                  <p className="mt-1 text-xs text-slate-500">{countryDisplayName}</p>
                ) : null}
              </div>

              <h3 className="border-t border-slate-100 pt-4 text-base font-semibold text-slate-900">
                Business details
              </h3>
              <div>
                <label htmlFor="provider-business-name" className={labelClass}>
                  Business name
                </label>
                <input
                  id="provider-business-name"
                  type="text"
                  required
                  autoComplete="organization"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={fieldClass}
                  placeholder="Registered or trading name"
                />
              </div>
              <div>
                <label htmlFor="provider-website" className={labelClass}>
                  Website{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="provider-website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={fieldClass}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label htmlFor="provider-address" className={labelClass}>
                  Physical address
                </label>
                <textarea
                  id="provider-address"
                  required
                  rows={3}
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  className={`${fieldClass} min-h-[5.5rem] resize-y`}
                  placeholder="Street, city, state or region"
                />
              </div>

              {profileError ? (
                <p className="text-sm text-red-700" role="alert">
                  {profileError}
                </p>
              ) : null}
              {profileNotice ? (
                <p
                  className="flex items-center gap-2 text-sm text-green-800"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  {profileNotice}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
              >
                {profileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Save changes
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">Account type</dt>
                <dd className="font-medium text-slate-800">Service provider</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800">{user?.email}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">Email verification</dt>
                <dd>
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      Not verified yet
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Email cannot be changed in the app yet.
            </p>
          </section>

          <section className={sectionClass}>
            <div className={accentBarClass} aria-hidden />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" aria-hidden />
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Change your password. You will stay signed in on this device.
            </p>
            <form
              className="relative mt-5 space-y-4"
              onSubmit={(e) => void handleChangePassword(e)}
            >
              <div>
                <label htmlFor="provider-current-password" className={labelClass}>
                  Current password
                </label>
                <input
                  id="provider-current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="provider-new-password" className={labelClass}>
                    New password
                  </label>
                  <input
                    id="provider-new-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="provider-confirm-password" className={labelClass}>
                    Confirm new password
                  </label>
                  <input
                    id="provider-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
              {passwordError ? (
                <p className="text-sm text-red-700" role="alert">
                  {passwordError}
                </p>
              ) : null}
              {passwordNotice ? (
                <p
                  className="flex items-center gap-2 text-sm text-green-800"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  {passwordNotice}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/50 bg-white px-5 py-2.5 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 disabled:opacity-60"
              >
                {passwordSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Update password
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
