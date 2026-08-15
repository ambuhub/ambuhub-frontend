"use client";

import { ClipboardList } from "lucide-react";
import { ProviderDispatchRequestsList } from "@/components/dispatch/ProviderDispatchRequestsList";

export default function DispatchRequestsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Requests</h1>
            <p className="text-sm text-slate-600">
              Accept incoming offers and track active dispatches.
            </p>
          </div>
        </div>
      </header>

      <ProviderDispatchRequestsList
        mode="crew"
        detailBasePath="/dispatch/requests"
      />
    </div>
  );
}
