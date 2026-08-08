"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import { AmbuhubLogo } from "@/components/AmbuhubLogo";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/admin/login`, {
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
      if (data.user?.role !== "admin") {
        setError("Admin access required.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-white p-6 shadow-2xl shadow-indigo-950/40 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <AmbuhubLogo className="h-8 w-auto" />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200/80">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Admin portal
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Use your Ambuhub admin credentials to continue.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Sign in
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
