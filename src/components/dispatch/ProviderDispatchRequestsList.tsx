"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  acceptDispatchOffer,
  dispatchStatusLabel,
  fetchProviderDispatchRequests,
  isProviderActiveDispatch,
  rejectDispatchOffer,
  type DispatchRequestDto,
  type DispatchStatus,
} from "@/lib/dispatch";

function secondsRemaining(expiresAt: string): number {
  return Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}

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
  tone: "incoming" | "active" | "completed";
};

function groupRequests(requests: DispatchRequestDto[]): Section[] {
  const incoming: DispatchRequestDto[] = [];
  const active: DispatchRequestDto[] = [];
  const completed: DispatchRequestDto[] = [];

  for (const request of requests) {
    if (request.status === "offered") {
      incoming.push(request);
    } else if (isProviderActiveDispatch(request.status)) {
      active.push(request);
    } else {
      completed.push(request);
    }
  }

  const sections: Section[] = [];
  if (incoming.length > 0) {
    sections.push({ title: "Incoming", requests: incoming, tone: "incoming" });
  }
  if (active.length > 0) {
    sections.push({ title: "Active", requests: active, tone: "active" });
  }
  if (completed.length > 0) {
    sections.push({
      title: "Completed",
      requests: completed,
      tone: "completed",
    });
  }
  return sections;
}

function RequestRow({
  request,
  tone,
  onAccepted,
}: {
  request: DispatchRequestDto;
  tone: Section["tone"];
  onAccepted: (request: DispatchRequestDto) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(() =>
    request.offerExpiresAt ? secondsRemaining(request.offerExpiresAt) : 0,
  );

  const isIncoming = tone === "incoming";
  const isActive = tone === "active";

  useEffect(() => {
    if (!isIncoming || !request.offerExpiresAt) {
      return;
    }
    const tick = setInterval(() => {
      setCountdown(secondsRemaining(request.offerExpiresAt!));
    }, 1000);
    return () => clearInterval(tick);
  }, [isIncoming, request.offerExpiresAt]);

  async function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const accepted = await acceptDispatchOffer(request.id);
      onAccepted(accepted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accept failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      await rejectDispatchOffer(request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decline failed");
    } finally {
      setLoading(false);
    }
  }

  function handleRowClick() {
    if (isActive) {
      router.push(`/provider/dispatch/requests/${request.id}`);
    }
  }

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const borderClass =
    tone === "incoming"
      ? "border-red-200 bg-red-50/50"
      : tone === "active"
        ? "border-blue-200 bg-blue-50/40 cursor-pointer hover:border-blue-300"
        : "border-slate-200 bg-white";

  return (
    <div
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : undefined}
      onClick={isActive ? handleRowClick : undefined}
      onKeyDown={
        isActive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRowClick();
              }
            }
          : undefined
      }
      className={`rounded-xl border p-4 shadow-sm ${borderClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">
            {request.pickup.address ?? "Pickup location shared"}
          </p>
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

      {isIncoming && request.offerExpiresAt && (
        <p className="mt-2 text-sm font-medium text-red-800">
          Respond in {mins}:{secs.toString().padStart(2, "0")}
        </p>
      )}

      {isActive && (
        <p className="mt-2 text-sm font-medium text-blue-800">
          Tap to open live map
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {isIncoming && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading || countdown <= 0}
            onClick={(e) => void handleAccept(e)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Accept
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => void handleReject(e)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DispatchStatus }) {
  const tone =
    status === "offered"
      ? "bg-red-100 text-red-800"
      : isProviderActiveDispatch(status)
        ? "bg-blue-100 text-blue-800"
        : status === "arrived"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {dispatchStatusLabel(status)}
    </span>
  );
}

export function ProviderDispatchRequestsList() {
  const router = useRouter();
  const [requests, setRequests] = useState<DispatchRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const next = await fetchProviderDispatchRequests();
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

  function handleAccepted(request: DispatchRequestDto) {
    router.push(`/provider/dispatch/requests/${request.id}`);
  }

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
        No dispatch requests yet. Go on duty from the Dispatch page to receive
        incoming offers.
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
                onAccepted={handleAccepted}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
