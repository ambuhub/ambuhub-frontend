"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

type Props = {
  children: React.ReactNode;
  onPrevious: () => void;
  onLogIn: () => void;
};

export function AuthSignupSplitShell({
  children,
  onPrevious,
  onLogIn,
}: Props) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col md:flex-row">
      <aside className="relative flex min-h-[220px] w-full shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 px-8 py-10 md:min-h-0 md:w-[min(100%,380px)] md:max-w-[38%] md:py-12 lg:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, transparent, black 35%)",
          }}
        />
        <div className="relative z-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white hover:text-blue-100"
          >
            Ambuhub
          </Link>
          <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-lg backdrop-blur-sm">
            <UserPlus className="h-7 w-7 text-white" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Sign up to get started
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/90 sm:text-base">
            Signing up is simple, free, and fast. Join our platform and unlock new
            possibilities.
          </p>
        </div>
        <div className="relative z-10 hidden h-24 md:block" aria-hidden />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLogIn}
              className="font-semibold text-blue-800 hover:text-blue-950 hover:underline"
            >
              Log in
            </button>
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
