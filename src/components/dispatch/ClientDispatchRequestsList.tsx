"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dispatchStatusLabel,
  fetchClientDispatchHistory,
  isActiveDispatchStatus,
  isClientCancellableStatus,
  type DispatchRequestDto,
  type DispatchStatus,
} from "@/lib/dispatch";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Section = {
  title: string;
  requests: DispatchRequestDto[];
  tone: "active" | "completed";
};

function groupRequests(requests: DispatchRequestDto[]): Section[] {
  const active: DispatchRequestDto[] = [];
  const completed: DispatchRequestDto[] = [];

  for (const request of requests) {
    if (isActiveDispatchStatus(request.status)) {
      active.push(request);
    } else {
      completed.push(request);
    }
  }

  const sections: Section[] = [];
  if (active.length > 0) {
    sections.push({ title: "Active", requests: active, tone: "active" });
  }
  if (completed.length > 0) {
    sections.push({
      title: "Past requests",
      requests: completed,
      tone: "completed",
    });
  }
  return sections;
}

function StatusBadge({ status }: { status: DispatchStatus }) {
  const tone = isActiveDispatchStatus(status)
    ? "bg-blue-100 text-blue-800"
    : status === "arrived"
      ? "bg-emerald-100 text-emerald-800"
      : status === "cancelled"
        ? "bg-slate-100 text-slate-600"
        : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {dispatchStatusLabel(status)}
    </span>
  );
}

function RequestRow({
  request,
  tone,
}: {
  request: DispatchRequestDto;
  tone: Section["tone"];
}) {
  const router = useRouter();
  const isActive = tone === "active";

  function handleClick() {
    router.push(`/client/dispatch/${request.id}`);
  }

  const borderClass =
    tone === "active"
      ? "border-blue-200 bg-blue-50/40 cursor-pointer hover:border-blue-300"
      : "border-slate-200 bg-white cursor-pointer hover:border-slate-300";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`rounded-xl border p-4 shadow-sm transition-colors ${borderClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">
            {request.pickup.address ?? "Pickup location shared"}
          </p>
          {request.contactPhone && (
            <p className="mt-1 text-sm text-slate-700">
              Contact: {request.contactPhone}
            </p>
          )}
          {request.clientNotes && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {request.clientNotes}
            </p>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {formatTimestamp(request.createdAt)}
      </p>

      {request.assignedService && (
        <p className="mt-2 text-sm text-slate-600">
          {request.assignedService.title} · {request.assignedService.providerName}
        </p>
      )}

      {isActive && (
        <p className="mt-2 text-sm font-medium text-blue-800">
          Tap to view live status
        </p>
      )}

      {!isActive && isClientCancellableStatus(request.status) && (
        <p className="mt-2 text-sm font-medium text-slate-600">
          Tap to dismiss this request
        </p>
      )}
    </div>
  );
}

export function ClientDispatchRequestsList() {
  const [requests, setRequests] = useState<DispatchRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const next = await fetchClientDispatchHistory();
      setRequests(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
    const interval = setInterval(() => {
      void loadRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const sections = useMemo(() => groupRequests(requests), [requests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
        No ambulance requests yet. Use{" "}
        <span className="font-medium text-slate-800">Request Ambulance</span> to
        request a dispatch.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.requests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                tone={section.tone}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
