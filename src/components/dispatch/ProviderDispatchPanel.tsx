"use client";

import Link from "next/link";
import { Loader2, Pencil, Radio } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatMoney, parseSupportedCurrency } from "@/lib/currency";
import {
  fetchProviderDispatchServices,
  isProviderLocationFresh,
  type ProviderDispatchService,
} from "@/lib/dispatch";
import { updateDispatchServicePricing } from "@/lib/provider-dispatch-accounts";

export function ProviderDispatchPanel() {
  const [services, setServices] = useState<ProviderDispatchService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      const list = await fetchProviderDispatchServices();
      setServices(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
    const interval = setInterval(() => {
      void loadServices();
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadServices]);

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        Add a <strong>Medical transport → Ground Ambulance</strong> listing,
        then{" "}
        <Link
          href="/provider/dispatch?tab=create"
          className="font-semibold text-blue-800 underline"
        >
          create a dispatch account
        </Link>{" "}
        so crew can go on duty.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-950">
        Only dispatch crew accounts can go on duty and accept offers.{" "}
        <Link
          href="/provider/dispatch?tab=create"
          className="font-semibold underline"
        >
          Create Dispatch
        </Link>{" "}
        to assign a crew login to a listing.
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Fleet status
        </h2>
        {services.map((service) => (
          <FleetStatusRow key={service.id} service={service} onUpdated={loadServices} />
        ))}
      </section>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function FleetStatusRow({
  service,
  onUpdated,
}: {
  service: ProviderDispatchService;
  onUpdated: () => void;
}) {
  const linked = Boolean(service.hasDispatchAccount ?? service.dispatchUserId);
  const onDuty = service.dispatchEnabled;
  const locationFresh = isProviderLocationFresh(service.liveLocationUpdatedAt);
  const currency = parseSupportedCurrency(service.dispatchCurrency);
  const [editing, setEditing] = useState(false);
  const [dispatchIsFree, setDispatchIsFree] = useState(service.dispatchIsFree !== false);
  const [dispatchPrice, setDispatchPrice] = useState(
    service.dispatchPrice != null ? String(service.dispatchPrice) : "",
  );
  const [saving, setSaving] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  async function handleSavePricing() {
    setSaving(true);
    setPricingError(null);
    try {
      await updateDispatchServicePricing(service.id, {
        dispatchIsFree,
        dispatchPrice: dispatchIsFree ? null : Number(dispatchPrice),
      });
      setEditing(false);
      onUpdated();
    } catch (err) {
      setPricingError(err instanceof Error ? err.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{service.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {linked ? "Linked to dispatch account" : "No dispatch account yet"}
            {onDuty && service.liveLocationUpdatedAt
              ? ` · Location ${new Date(service.liveLocationUpdatedAt).toLocaleTimeString()}`
              : null}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Dispatch fee:{" "}
            {service.dispatchIsFree !== false
              ? "Free"
              : service.dispatchPrice != null
                ? formatMoney(service.dispatchPrice, currency)
                : "Paid"}
          </p>
          {onDuty && !locationFresh && (
            <p className="mt-1 text-xs font-medium text-amber-800">
              Location missing or stale — crew GPS may be inactive.
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
            onDuty
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <Radio className="h-4 w-4" aria-hidden />
          {onDuty ? "On duty" : "Off duty"}
        </span>
      </div>

      {linked && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit dispatch pricing
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={dispatchIsFree}
                    onChange={() => setDispatchIsFree(true)}
                  />
                  Free
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!dispatchIsFree}
                    onChange={() => setDispatchIsFree(false)}
                  />
                  Paid
                </label>
              </div>
              {!dispatchIsFree && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Trip fee ({currency})
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={currency === "GHS" ? 0.01 : 1}
                    value={dispatchPrice}
                    onChange={(e) => setDispatchPrice(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              )}
              {pricingError && (
                <p className="text-sm text-red-600">{pricingError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSavePricing()}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setDispatchIsFree(service.dispatchIsFree !== false);
                    setDispatchPrice(
                      service.dispatchPrice != null
                        ? String(service.dispatchPrice)
                        : "",
                    );
                    setPricingError(null);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
