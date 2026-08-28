"use client";

import { Loader2, Siren } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AvailableDispatchPicker } from "@/components/dispatch/AvailableDispatchPicker";
import {
  DispatchLocationPicker,
  type DispatchLocationValue,
} from "@/components/dispatch/DispatchLocationPicker";
import type { PublicAuthUser } from "@/lib/auth-redirect";
import {
  createDispatchRequest,
  fetchActiveDispatchRequest,
  type AvailableDispatchUnit,
} from "@/lib/dispatch";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function DispatchRequestForm() {
  const router = useRouter();
  const [step, setStep] = useState<"pickup" | "choose">("pickup");
  const [location, setLocation] = useState<DispatchLocationValue | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<AvailableDispatchUnit | null>(
    null,
  );
  const [contactPhone, setContactPhone] = useState("");
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

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { user?: PublicAuthUser };
        if (!cancelled && data.user?.phone) {
          setContactPhone((prev) => prev || data.user!.phone);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!location) {
        setError("Select your pickup location first.");
        return;
      }

      if (step === "pickup") {
        setStep("choose");
        return;
      }

      if (!selectedUnit) {
        setError("Choose an ambulance to continue.");
        return;
      }

      const phone = contactPhone.trim();
      if (!phone) {
        setError("Enter a phone number for dispatch to call on arrival.");
        return;
      }

      setSubmitting(true);
      try {
        const request = await createDispatchRequest({
          serviceId: selectedUnit.serviceId,
          locationSource: location.locationSource,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address ?? undefined,
          contactPhone: phone,
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
    [contactPhone, location, notes, router, selectedUnit, step],
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

      {step === "pickup" ? (
        <>
          <DispatchLocationPicker value={location} onChange={setLocation} />

          <div>
            <label
              htmlFor="dispatch-contact-phone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone for dispatch to call
            </label>
            <input
              id="dispatch-contact-phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={32}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Number to call on arrival"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="dispatch-notes"
              className="block text-sm font-medium text-slate-700"
            >
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
        </>
      ) : (
        location && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("pickup");
                setSelectedUnit(null);
                setError(null);
              }}
              className="text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              ← Change pickup location
            </button>

            <AvailableDispatchPicker
              latitude={location.latitude}
              longitude={location.longitude}
              selectedServiceId={selectedUnit?.serviceId ?? null}
              onSelect={setSelectedUnit}
              disabled={submitting}
            />
          </>
        )
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          submitting ||
          !location ||
          (step === "choose" && !selectedUnit)
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Siren className="h-4 w-4" aria-hidden />
        )}
        {step === "pickup" ? "Find nearby ambulances" : "Request ambulance"}
      </button>
    </form>
  );
}
