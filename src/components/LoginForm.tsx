"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAuthPath, type AuthUserRole } from "@/lib/auth-redirect";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type Props = {
  onSwitchToSignup: () => void;
  /** Safe internal path only (e.g. from `?next=` on /auth). */
  afterLoginRedirect?: string | null;
};

function isSafeInternalNextPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }
  if (path.includes("://") || path.includes("\\")) {
    return false;
  }
  return true;
}

export function LoginForm({ onSwitchToSignup, afterLoginRedirect }: Props) {
  const router = useRouter();
  const { refresh: refreshSession } = useSessionAndCart();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as {
        message?: string;
        user?: { role?: string; emailVerified?: boolean };
        requiresEmailVerification?: boolean;
      };
      if (!res.ok) {
        setError(data.message ?? "Login failed");
        return;
      }

      await refreshSession();

      if (data.requiresEmailVerification || data.user?.emailVerified === false) {
        router.push("/auth/verify-email");
        router.refresh();
        return;
      }

      const role = data.user?.role;
      const defaultNext =
        role === "service_provider" ||
        role === "client" ||
        role === "patient"
          ? postAuthPath(role as AuthUserRole)
          : "/";
      const trimmed = afterLoginRedirect?.trim();
      const unsafeAdminNext =
        !!trimmed &&
        (trimmed === "/admin" || trimmed.startsWith("/admin/"));
      const next =
        trimmed && isSafeInternalNextPath(trimmed) && !unsafeAdminNext
          ? trimmed
          : defaultNext;

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  if (view === "forgot") {
    return (
      <ForgotPasswordForm
        initialEmail={email.trim()}
        onBackToLogin={() => setView("login")}
      />
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Log in
      </h1>
      <p className="mt-2 text-sm text-foreground/65">
        Access your Ambuhub account with your email and password.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="text-sm font-semibold text-ambuhub-brand hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
            placeholder="Your password"
          />
        </div>

        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-foreground/70">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
