"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { DispatchTrackingMap } from "@/components/dispatch/DispatchTrackingMap";

export default function ClientDispatchTrackingPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <Link
        href="/client/dispatch/requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        My requests
      </Link>

      <h1 className="text-xl font-semibold text-slate-900">Dispatch status</h1>

      <DispatchTrackingMap
        requestId={requestId}
        role="client"
        onRequestUpdate={(request) => {
          if (request.status === "cancelled") {
            router.push("/client/dispatch/requests");
          }
        }}
      />
    </div>
  );
}
