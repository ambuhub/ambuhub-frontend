"use client";

import { Loader2, Radio } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DispatchTrackingMap } from "@/components/dispatch/DispatchTrackingMap";
import { ProviderOfferCard } from "@/components/dispatch/ProviderOfferCard";
import {
  fetchCrewDispatchServices,
  isProviderLocationFresh,
  setServiceDispatchEnabled,
  updateServiceLiveLocation,
  type DispatchRequestDto,
  type ProviderDispatchService,
} from "@/lib/dispatch";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
    });
  });
}

export function CrewDispatchPanel() {
  const [services, setServices] = useState<ProviderDispatchService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<DispatchRequestDto | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const onDutyServiceId = services.find((s) => s.dispatchEnabled)?.id ?? null;
  const onDutyService = services.find((s) => s.dispatchEnabled) ?? null;
  const locationIsStale =
    onDutyService != null &&
    !isProviderLocationFresh(onDutyService.liveLocationUpdatedAt);

  const loadServices = useCallback(async () => {
    try {
      const list = await fetchCrewDispatchServices();
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
  }, [loadServices]);

  useEffect(() => {
    if (!onDutyServiceId) {
      return;
    }
    const interval = setInterval(() => {
      void loadServices();
    }, 30_000);
    return () => clearInterval(interval);
  }, [onDutyServiceId, loadServices]);

  const stopLocationTracking = useCallback(() => {
    if (locationWatchRef.current != null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  }, []);

  const startLocationTracking = useCallback(
    (serviceId: string) => {
      stopLocationTracking();
      if (!navigator.geolocation) {
        setError("Geolocation is not available in this browser.");
        return;
      }

      let lastPos: GeolocationPosition | null = null;

      locationWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          lastPos = pos;
        },
        () => {
          setError("Could not track your location. Enable location access.");
        },
        { enableHighAccuracy: true, maximumAge: 5000 },
      );

      locationIntervalRef.current = setInterval(() => {
        if (!lastPos) {
          return;
        }
        void updateServiceLiveLocation(
          serviceId,
          lastPos.coords.latitude,
          lastPos.coords.longitude,
        )
          .then(() => loadServices())
          .catch(() => {});
      }, 10_000);
    },
    [stopLocationTracking, loadServices],
  );

  useEffect(() => {
    if (onDutyServiceId) {
      startLocationTracking(onDutyServiceId);
    } else {
      stopLocationTracking();
    }
    return stopLocationTracking;
  }, [onDutyServiceId, startLocationTracking, stopLocationTracking]);

  async function handleToggle(service: ProviderDispatchService) {
    const next = !service.dispatchEnabled;
    setTogglingId(service.id);
    setError(null);
    try {
      if (next) {
        const pos = await getCurrentPosition();
        await setServiceDispatchEnabled(service.id, true, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } else {
        await setServiceDispatchEnabled(service.id, false);
        stopLocationTracking();
      }

      await loadServices();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : next
            ? "Could not go on duty. Enable location access and try again."
            : "Toggle failed",
      );
    } finally {
      setTogglingId(null);
    }
  }

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
        No ambulance listing is linked to this dispatch account. Ask your
        provider to create a dispatch account for a ground ambulance listing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          On duty
        </h2>
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{service.title}</p>
              {service.dispatchEnabled && service.liveLocationUpdatedAt && (
                <p className="text-xs text-slate-500">
                  Location updated{" "}
                  {new Date(service.liveLocationUpdatedAt).toLocaleTimeString()}
                </p>
              )}
              {service.dispatchEnabled &&
                !isProviderLocationFresh(service.liveLocationUpdatedAt) && (
                  <p className="mt-1 text-xs font-medium text-amber-800">
                    Location not shared — you will not receive dispatch requests
                    until GPS is active.
                  </p>
                )}
            </div>
            <button
              type="button"
              disabled={togglingId === service.id}
              onClick={() => void handleToggle(service)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                service.dispatchEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              } disabled:opacity-60`}
            >
              {togglingId === service.id ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Radio className="h-4 w-4" aria-hidden />
              )}
              {service.dispatchEnabled ? "On duty" : "Go on duty"}
            </button>
          </div>
        ))}
      </section>

      {locationIsStale && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          Your location is missing or outdated. Clients cannot match with you
          until your browser shares a fresh GPS fix. Try going off duty and on
          duty again, and allow location access when prompted.
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!activeRequest && onDutyServiceId && !locationIsStale && (
        <ProviderOfferCard onAccepted={setActiveRequest} />
      )}

      {activeRequest && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Active dispatch
          </h2>
          <DispatchTrackingMap
            requestId={activeRequest.id}
            role="provider"
            showCancel={false}
            showArrived
            onRequestUpdate={(req) => {
              setActiveRequest(req);
              if (req.status === "arrived" || req.status === "cancelled") {
                setActiveRequest(null);
              }
            }}
          />
        </section>
      )}
    </div>
  );
}
