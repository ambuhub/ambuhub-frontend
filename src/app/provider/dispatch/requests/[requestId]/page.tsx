"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { DispatchTrackingMap } from "@/components/dispatch/DispatchTrackingMap";

export default function ProviderDispatchRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6">
      <Link
        href="/provider/dispatch?tab=requests"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All requests
      </Link>

      <h1 className="text-xl font-semibold text-slate-900">Active dispatch</h1>

      <DispatchTrackingMap
        requestId={requestId}
        role="provider"
        mapHeight="calc(100dvh - 10rem)"
      />
    </div>
  );
}
