"use client";

import { Loader2, Siren } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  DispatchLocationPicker,
  type DispatchLocationValue,
} from "@/components/dispatch/DispatchLocationPicker";
import {
  createDispatchRequest,
  fetchActiveDispatchRequest,
} from "@/lib/dispatch";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function DispatchRequestForm() {
  const router = useRouter();
  const [location, setLocation] = useState<DispatchLocationValue | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingActive, setCheckingActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchActiveDispatchRequest()
      .then((active) => {
        if (!cancelled && active) {
          router.replace(`/client/dispatch/${active.id}`);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setCheckingActive(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!location) {
        setError("Select your pickup location first.");
        return;
      }

      setSubmitting(true);
      try {
        const request = await createDispatchRequest({
          locationSource: location.locationSource,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address ?? undefined,
          notes: notes.trim() || undefined,
        });
        router.push(`/client/dispatch/${request.id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed";
        if (message.startsWith("ACTIVE:")) {
          const id = message.slice("ACTIVE:".length);
          router.push(`/client/dispatch/${id}`);
          return;
        }
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [location, notes, router],
  );

  if (checkingActive) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-950">
        <p className="font-medium">Emergency notice</p>
        <p className="mt-1 text-blue-900/90">
          For life-threatening emergencies, call your local emergency number
          first. AmbuHub connects you with private ambulance providers nearby.
        </p>
      </div>

      <DispatchLocationPicker value={location} onChange={setLocation} />

      <div>
        <label htmlFor="dispatch-notes" className="block text-sm font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea
          id="dispatch-notes"
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe the situation or special instructions…"
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !location}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Siren className="h-4 w-4" aria-hidden />
        )}
        Request ambulance
      </button>
    </form>
  );
}
