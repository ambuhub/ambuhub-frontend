"use client";

import { Loader2, Siren } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProviderDispatchAccountsList } from "@/components/dispatch/ProviderDispatchAccountsList";
import { ProviderDispatchAccountsPanel } from "@/components/dispatch/ProviderDispatchAccountsPanel";
import { ProviderDispatchPanel } from "@/components/dispatch/ProviderDispatchPanel";
import { ProviderDispatchRequestsList } from "@/components/dispatch/ProviderDispatchRequestsList";

type DispatchTab = "overview" | "requests" | "create" | "accounts";

function tabFromSearch(value: string | null): DispatchTab {
  if (value === "requests") return "requests";
  if (value === "create") return "create";
  if (value === "accounts") return "accounts";
  return "overview";
}

function tabClass(active: boolean): string {
  return `border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
    active
      ? "border-blue-600 text-blue-700"
      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
  }`;
}

function ProviderDispatchTabs() {
  const searchParams = useSearchParams();
  const tab = tabFromSearch(searchParams.get("tab"));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dispatch</h1>
            <p className="text-sm text-slate-600">
              Monitor fleet duty, review requests, and create crew accounts.
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex flex-wrap gap-1" aria-label="Dispatch sections">
          <Link
            href="/provider/dispatch"
            className={tabClass(tab === "overview")}
            aria-current={tab === "overview" ? "page" : undefined}
          >
            Dispatch
          </Link>
          <Link
            href="/provider/dispatch?tab=requests"
            className={tabClass(tab === "requests")}
            aria-current={tab === "requests" ? "page" : undefined}
          >
            Dispatch requests
          </Link>
          <Link
            href="/provider/dispatch?tab=create"
            className={tabClass(tab === "create")}
            aria-current={tab === "create" ? "page" : undefined}
          >
            Create Dispatch
          </Link>
          <Link
            href="/provider/dispatch?tab=accounts"
            className={tabClass(tab === "accounts")}
            aria-current={tab === "accounts" ? "page" : undefined}
          >
            Dispatch accounts
          </Link>
        </nav>
      </div>

      {tab === "overview" ? (
        <ProviderDispatchPanel />
      ) : tab === "requests" ? (
        <ProviderDispatchRequestsList />
      ) : tab === "create" ? (
        <ProviderDispatchAccountsPanel />
      ) : (
        <ProviderDispatchAccountsList />
      )}
    </div>
  );
}

export default function ProviderDispatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      }
    >
      <ProviderDispatchTabs />
    </Suspense>
  );
}
