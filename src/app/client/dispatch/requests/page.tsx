"use client";

import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { ClientDispatchRequestsList } from "@/components/dispatch/ClientDispatchRequestsList";

export default function ClientDispatchRequestsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              My requests
            </h1>
            <p className="text-sm text-slate-600">
              Track active dispatches and view past requests.
            </p>
          </div>
        </div>
        <Link
          href="/client/dispatch"
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New request
        </Link>
      </header>

      <ClientDispatchRequestsList />
    </div>
  );
}
