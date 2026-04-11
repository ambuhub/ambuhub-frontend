"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAuthPath, type AuthUserRole } from "@/lib/auth-redirect";
import { getApiBaseUrl } from "@/lib/api";
import type { SignupRole } from "./SignupRoleCards";

type Props = {
  role: SignupRole;
  onBack: () => void;
};

const roleLabels: Record<SignupRole, string> = {
  patient: "Patient",
  service_provider: "Service provider",
};

export function SignupForm({ role, onBack }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country: country.trim(),
          password,
          role,
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
        authRole === "service_provider" || authRole === "patient"
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

  return (
    <div className="w-full max-w-md rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
      >
        Back to role choice
      </button>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
        Sign up as {roleLabels[role]}
      </h1>
      <p className="mt-2 text-sm text-foreground/65">
        Email verification with a one-time code will be added soon. For now you
        can use your account right after signing up.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="signup-name"
            className="block text-sm font-medium text-foreground"
          >
            Full name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-foreground"
          >
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
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="signup-phone"
            className="block text-sm font-medium text-foreground"
          >
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
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label
            htmlFor="signup-country"
            className="block text-sm font-medium text-foreground"
          >
            Country
          </label>
          <input
            id="signup-country"
            name="country"
            type="text"
            autoComplete="country-name"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="Country or region"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-foreground"
          >
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
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
