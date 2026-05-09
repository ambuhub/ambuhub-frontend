"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAuthPath, type AuthUserRole } from "@/lib/auth-redirect";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";

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

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

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
        user?: { role?: string };
      };
      if (!res.ok) {
        setError(data.message ?? "Login failed");
        return;
      }
      const role = data.user?.role;
      const defaultNext =
        role === "service_provider" || role === "client" || role === "patient"
          ? postAuthPath(role as AuthUserRole)
          : "/";
      const trimmed = afterLoginRedirect?.trim();
      const next =
        trimmed && isSafeInternalNextPath(trimmed) ? trimmed : defaultNext;

      // Session/cart UI (e.g. marketplace cards) is client-state driven and the
      // provider stays mounted across navigation. Refresh it now so the next page
      // immediately reflects the logged-in state without a manual reload.
      await refreshSession();

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  function openForgotPassword() {
    setView("forgot");
    setForgotEmail(email.trim());
    setForgotPassword("");
    setForgotConfirm("");
    setForgotError(null);
    setForgotSuccess(null);
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    if (forgotPassword !== forgotConfirm) {
      setForgotError("New password and confirmation do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          newPassword: forgotPassword,
        }),
      });
      const data = (await res.json()) as { message?: string; ok?: boolean };
      if (!res.ok) {
        setForgotError(data.message ?? "Could not reset password");
        return;
      }
      setForgotSuccess(
        data.message ??
          "If an account exists for that email, the password has been updated.",
      );
      setForgotPassword("");
      setForgotConfirm("");
    } catch {
      setForgotError("Network error. Is the API running?");
    } finally {
      setForgotLoading(false);
    }
  }

  if (view === "forgot") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-foreground/65">
          Enter the email on your account and choose a new password. This does not send
          email or OTP—only use on accounts you control.
        </p>

        <form onSubmit={handleForgotSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="forgot-new-password"
              className="block text-sm font-medium text-foreground"
            >
              New password
            </label>
            <input
              id="forgot-new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={forgotPassword}
              onChange={(e) => setForgotPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label
              htmlFor="forgot-confirm-password"
              className="block text-sm font-medium text-foreground"
            >
              Confirm new password
            </label>
            <input
              id="forgot-confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={forgotConfirm}
              onChange={(e) => setForgotConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
              placeholder="Repeat new password"
            />
          </div>

          {forgotError ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {forgotError}
            </p>
          ) : null}
          {forgotSuccess ? (
            <p
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900"
              role="status"
            >
              {forgotSuccess}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {forgotLoading ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground/70">
          <button
            type="button"
            onClick={() => {
              setView("login");
              setForgotError(null);
              setForgotSuccess(null);
            }}
            className="font-semibold text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
          >
            Back to sign in
          </button>
        </p>
      </div>
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

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              onClick={openForgotPassword}
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
