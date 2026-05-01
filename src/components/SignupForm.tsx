"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAuthPath, type AuthUserRole } from "@/lib/auth-redirect";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import type { SignupRole } from "./SignupRoleCards";
import { CountrySelect } from "@/components/ui/CountrySelect";

type Props = {
  role: SignupRole;
  onBack: () => void;
  /** When true, omits card chrome and top back link (used inside AuthSignupSplitShell). */
  splitLayout?: boolean;
};

const roleLabels: Record<SignupRole, string> = {
  client: "Client",
  service_provider: "Service provider",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20";

export function SignupForm({ role, onBack, splitLayout }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!country.trim()) {
      setError("Please select a country.");
      return;
    }
    if (role === "client" && !dateOfBirth.trim()) {
      setError("Please enter your date of birth.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          countryCode: country.trim(),
          password,
          role,
          ...(role === "service_provider"
            ? {
                businessName: businessName.trim(),
                ...(website.trim() ? { website: website.trim() } : {}),
                physicalAddress: physicalAddress.trim(),
              }
            : { dateOfBirth: dateOfBirth.trim() }),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        user?: { role?: string };
      };
      if (!res.ok) {
        setError(data.message ?? "Sign up failed");
        return;
      }
      const authRole = data.user?.role;
      const next =
        authRole === "service_provider" ||
        authRole === "client" ||
        authRole === "patient"
          ? postAuthPath(authRole as AuthUserRole)
          : "/";
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  const shell = splitLayout;
  const labelClass = shell
    ? "block text-sm font-medium text-slate-700"
    : "block text-sm font-medium text-foreground";
  const inputFieldClass = shell ? inputClass : "mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25";
  const submitClass = shell
    ? "w-full rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-900/25 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    : "w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

  const inner = (
    <>
      {!shell && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
        >
          Back to role choice
        </button>
      )}

      <h1
        className={
          shell
            ? "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            : "mt-4 text-2xl font-bold tracking-tight text-foreground"
        }
      >
        Sign up as {roleLabels[role]}
      </h1>
      <p
        className={
          shell
            ? "mt-2 text-sm leading-relaxed text-slate-600"
            : "mt-2 text-sm text-foreground/65"
        }
      >
        Email verification with a one-time code will be added soon. For now you
        can use your account right after signing up.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="signup-first-name" className={labelClass}>
            First name
          </label>
          <input
            id="signup-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputFieldClass}
            placeholder="Jane"
          />
        </div>
        <div>
          <label htmlFor="signup-last-name" className={labelClass}>
            Last name
          </label>
          <input
            id="signup-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputFieldClass}
            placeholder="Doe"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className={labelClass}>
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputFieldClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="signup-phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputFieldClass}
            placeholder="+1 555 000 0000"
          />
        </div>
        {role === "client" && (
          <div className="sm:col-span-2">
            <label htmlFor="signup-dob" className={labelClass}>
              Date of birth
            </label>
            <input
              id="signup-dob"
              name="dateOfBirth"
              type="date"
              autoComplete="bday"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputFieldClass}
            />
            <p
              className={
                shell
                  ? "mt-1.5 text-xs text-slate-500"
                  : "mt-1.5 text-xs text-foreground/55"
              }
            >
              You must be at least 13 years old.
            </p>
          </div>
        )}
        <div
          className={
            role === "service_provider" ? undefined : "sm:col-span-2"
          }
        >
          <label htmlFor="signup-country" className={labelClass}>
            Country
          </label>
          <CountrySelect
            id="signup-country"
            value={country}
            onChange={setCountry}
            required
            placeholder="Select country"
            className={inputFieldClass}
          />
        </div>
        {role === "service_provider" && (
          <>
            <div>
              <label htmlFor="signup-business-name" className={labelClass}>
                Business name
              </label>
              <input
                id="signup-business-name"
                name="businessName"
                type="text"
                autoComplete="organization"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={inputFieldClass}
                placeholder="Registered or trading name"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="signup-website" className={labelClass}>
                Website{" "}
                <span
                  className={
                    shell ? "font-normal text-slate-500" : "font-normal text-foreground/55"
                  }
                >
                  (optional)
                </span>
              </label>
              <input
                id="signup-website"
                name="website"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputFieldClass}
                placeholder="https://example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="signup-address" className={labelClass}>
                Physical address
              </label>
              <textarea
                id="signup-address"
                name="physicalAddress"
                required
                rows={3}
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                className={`${inputFieldClass} resize-y min-h-[5.5rem]`}
                placeholder="Street, city, state or region"
              />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="signup-password" className={labelClass}>
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputFieldClass}
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`${submitClass} sm:col-span-2`}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </>
  );

  if (shell) {
    return <div className="w-full">{inner}</div>;
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
      {inner}
    </div>
  );
}
