"use client";

import { Siren } from "lucide-react";
import { ProviderDispatchPanel } from "@/components/dispatch/ProviderDispatchPanel";

export default function ProviderDispatchPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dispatch</h1>
            <p className="text-sm text-slate-600">
              Go on duty to receive live ambulance requests nearby.
            </p>
          </div>
        </div>
      </header>

      <ProviderDispatchPanel />
    </div>
  );
}
