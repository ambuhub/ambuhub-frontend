"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  acceptDispatchOffer,
  fetchCrewOffer,
  rejectDispatchOffer,
  type DispatchRequestDto,
} from "@/lib/dispatch";

type Props = {
  onAccepted: (request: DispatchRequestDto) => void;
};

function secondsRemaining(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export function ProviderOfferCard({ onAccepted }: Props) {
  const [offer, setOffer] = useState<DispatchRequestDto | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOffer = useCallback(async () => {
    try {
      const next = await fetchCrewOffer();
      setOffer(next);
      if (next?.offerExpiresAt) {
        setCountdown(secondsRemaining(next.offerExpiresAt));
      }
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    void loadOffer();
    const interval = setInterval(() => {
      void loadOffer();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadOffer]);

  useEffect(() => {
    if (!offer?.offerExpiresAt) {
      return;
    }
    const tick = setInterval(() => {
      setCountdown(secondsRemaining(offer.offerExpiresAt!));
    }, 1000);
    return () => clearInterval(tick);
  }, [offer?.offerExpiresAt]);

  async function handleAccept() {
    if (!offer) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const accepted = await acceptDispatchOffer(offer.id);
      setOffer(null);
      onAccepted(accepted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accept failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!offer) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await rejectDispatchOffer(offer.id);
      setOffer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setLoading(false);
    }
  }

  if (!offer) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-600">
        No incoming requests. Stay on duty to receive dispatch offers.
      </div>
    );
  }

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
        Incoming request
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        {offer.pickup.address ?? "Pickup location shared"}
      </p>
      {offer.contactPhone && (
        <p className="mt-2 text-sm text-slate-700">
          Call on arrival:{" "}
          <a
            href={`tel:${offer.contactPhone}`}
            className="font-medium text-blue-700 underline-offset-2 hover:underline"
          >
            {offer.contactPhone}
          </a>
        </p>
      )}
      {offer.clientNotes && (
        <p className="mt-2 text-sm text-slate-700">{offer.clientNotes}</p>
      )}
      <p className="mt-3 text-sm font-medium text-red-800">
        Respond in {mins}:{secs.toString().padStart(2, "0")}
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading || countdown <= 0}
          onClick={() => void handleAccept()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Accept
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleReject()}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
