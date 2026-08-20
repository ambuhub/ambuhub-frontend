"use client";

import Link from "next/link";
import { Loader2, Radio } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchProviderDispatchServices,
  isProviderLocationFresh,
  type ProviderDispatchService,
} from "@/lib/dispatch";

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
          <FleetStatusRow key={service.id} service={service} />
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

function FleetStatusRow({ service }: { service: ProviderDispatchService }) {
  const linked = Boolean(service.hasDispatchAccount ?? service.dispatchUserId);
  const onDuty = service.dispatchEnabled;
  const locationFresh = isProviderLocationFresh(service.liveLocationUpdatedAt);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="font-medium text-slate-900">{service.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {linked ? "Linked to dispatch account" : "No dispatch account yet"}
          {onDuty && service.liveLocationUpdatedAt
            ? ` · Location ${new Date(service.liveLocationUpdatedAt).toLocaleTimeString()}`
            : null}
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
  );
}
