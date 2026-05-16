"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Shield, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import type { PublicAuthUser } from "@/lib/auth-redirect";
import {
  patchClientProfile,
  postChangePassword,
} from "@/lib/client-profile";
import { fetchAuthMe } from "@/lib/marketplace-cart";
import { getCountryNameByCode } from "@/lib/countries";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25";

const labelClass = "block text-sm font-medium text-slate-700";

function userToForm(user: PublicAuthUser) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode.trim().toLowerCase(),
    dateOfBirth: user.dateOfBirth ?? "",
  };
}

export default function ClientProfilePage() {
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/client/profile")}`;
  const { refresh } = useSessionAndCart();

  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
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
        setLoadError("Sign in to view and edit your profile.");
        return;
      }
      setUser(u);
      const form = userToForm(u);
      setFirstName(form.firstName);
      setLastName(form.lastName);
      setPhone(form.phone);
      setCountryCode(form.countryCode);
      setDateOfBirth(form.dateOfBirth);
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
    if (!dateOfBirth.trim()) {
      setProfileError("Please enter your date of birth.");
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await patchClientProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        countryCode: countryCode.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
      setUser(updated);
      const form = userToForm(updated);
      setFirstName(form.firstName);
      setLastName(form.lastName);
      setPhone(form.phone);
      setCountryCode(form.countryCode);
      setDateOfBirth(form.dateOfBirth);
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
      await postChangePassword({
        currentPassword,
        newPassword,
      });
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
        <h1 className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          <User className="h-8 w-8 text-cyan-600 sm:h-9 sm:w-9" aria-hidden />
          Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your name, contact details, and account security.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
        </div>
      ) : loadError ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900">
            {loadError}
          </div>
          <Link
            href={loginHref}
            className="inline-flex rounded-lg border border-cyan-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/60"
          >
            Go to sign in
          </Link>
        </div>
      ) : user?.role === "service_provider" ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          You are signed in as a service provider. Business profile editing will be
          available on the{" "}
          <Link href="/provider/profile" className="font-semibold underline">
            provider profile
          </Link>{" "}
          page.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <section className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 p-5 shadow-[0_0_28px_-8px_rgba(34,211,238,0.3)] sm:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400" />
            <h2 className="text-lg font-semibold text-[#0c4a6e]">
              Personal information
            </h2>
            <form className="relative mt-5 space-y-4" onSubmit={(e) => void handleSaveProfile(e)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-first-name" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="profile-last-name" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="profile-last-name"
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
                <label htmlFor="profile-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  readOnly
                  value={user?.email ?? ""}
                  className={`${fieldClass} cursor-not-allowed bg-slate-50 text-slate-600`}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Email cannot be changed in the app yet.
                </p>
              </div>
              <div>
                <label htmlFor="profile-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="profile-country" className={labelClass}>
                  Country
                </label>
                <CountrySelect
                  id="profile-country"
                  value={countryCode}
                  onChange={setCountryCode}
                  required
                  className="mt-1.5"
                />
                {countryDisplayName ? (
                  <p className="mt-1 text-xs text-slate-500">{countryDisplayName}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="profile-dob" className={labelClass}>
                  Date of birth
                </label>
                <input
                  id="profile-dob"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={fieldClass}
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0069b4] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#004a7c] disabled:opacity-60"
              >
                {profileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Save changes
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#0c4a6e]">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-500">Account type</dt>
                <dd className="font-medium text-slate-800">Client account</dd>
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
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-600" aria-hidden />
              <h2 className="text-lg font-semibold text-[#0c4a6e]">Security</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Change your password. You will stay signed in on this device.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => void handleChangePassword(e)}
            >
              <div>
                <label htmlFor="current-password" className={labelClass}>
                  Current password
                </label>
                <input
                  id="current-password"
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
                  <label htmlFor="new-password" className={labelClass}>
                    New password
                  </label>
                  <input
                    id="new-password"
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
                  <label htmlFor="confirm-password" className={labelClass}>
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-white px-5 py-2.5 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:bg-cyan-50 disabled:opacity-60"
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
