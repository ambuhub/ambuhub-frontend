"use client";

import type { DispatchRequestDto, DispatchStatus } from "@/lib/dispatch";
import { dispatchStatusLabel } from "@/lib/dispatch";

const statusStyles: Partial<Record<DispatchStatus, string>> = {
  searching: "border-amber-200 bg-amber-50 text-amber-950",
  offered: "border-amber-200 bg-amber-50 text-amber-950",
  accepted: "border-blue-200 bg-blue-50 text-blue-950",
  en_route: "border-emerald-200 bg-emerald-50 text-emerald-950",
  arrived: "border-emerald-300 bg-emerald-100 text-emerald-950",
  cancelled: "border-slate-200 bg-slate-50 text-slate-700",
  no_provider: "border-red-200 bg-red-50 text-red-950",
  expired: "border-slate-200 bg-slate-50 text-slate-700",
};

export function DispatchStatusBanner({
  request,
}: {
  request: Pick<
    DispatchRequestDto,
    "status" | "paymentStatus" | "assignedService"
  >;
}) {
  const label = dispatchStatusLabel(request.status, {
    paymentStatus: request.paymentStatus,
    hasAssignedService: Boolean(request.assignedService),
  });

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${statusStyles[request.status] ?? "border-slate-200 bg-slate-50"}`}
    >
      {label}
    </div>
  );
}
