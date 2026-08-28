"use client";

import { Loader2, MapPin, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/lib/currency";
import {
  fetchAvailableDispatchUnits,
  type AvailableDispatchUnit,
} from "@/lib/dispatch";
import { formatDistance } from "@/lib/decode-polyline";

type Props = {
  latitude: number;
  longitude: number;
  selectedServiceId?: string | null;
  onSelect: (unit: AvailableDispatchUnit) => void;
  disabled?: boolean;
};

export function AvailableDispatchPicker({
  latitude,
  longitude,
  selectedServiceId,
  onSelect,
  disabled = false,
}: Props) {
  const [units, setUnits] = useState<AvailableDispatchUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchAvailableDispatchUnits(latitude, longitude);
      setUnits(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ambulances");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Finding nearby ambulances…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        No on-duty ambulances are available nearby right now. Try again in a
        moment or contact emergency services if this is urgent.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Choose an ambulance ({units.length} nearby)
      </p>
      <ul className="space-y-2">
        {units.map((unit) => {
          const selected = selectedServiceId === unit.serviceId;
          return (
            <li key={unit.serviceId}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(unit)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Truck className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900">
                    {unit.title}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {unit.providerName}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {formatDistance(unit.distanceMeters)} away
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-900">
                  {unit.isFree
                    ? "Free"
                    : unit.price != null
                      ? formatMoney(unit.price, unit.currency)
                      : "Paid"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
