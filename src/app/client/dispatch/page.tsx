"use client";

import { Siren } from "lucide-react";
import { DispatchRequestForm } from "@/components/dispatch/DispatchRequestForm";

export default function ClientDispatchPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Request ambulance
            </h1>
            <p className="text-sm text-slate-600">
              We will find the nearest available ground ambulance.
            </p>
          </div>
        </div>
      </header>

      <DispatchRequestForm />
    </div>
  );
}
