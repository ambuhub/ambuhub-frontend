"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Loader2, LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DispatchStatusBanner } from "@/components/dispatch/DispatchStatusBanner";
import {
  DEFAULT_MAP_CENTER,
  useGoogleMaps,
} from "@/components/dispatch/GoogleMapsProvider";
import {
  decodePolyline,
  formatDistance,
  formatDuration,
} from "@/lib/decode-polyline";
import {
  cancelDispatchRequest,
  fetchDispatchRequest,
  isActiveDispatchStatus,
  isClientCancellableStatus,
  markDispatchArrived,
  type DispatchRequestDto,
} from "@/lib/dispatch";

const defaultMapHeight = "420px";

type Props = {
  requestId: string;
  role: "client" | "provider";
  onRequestUpdate?: (request: DispatchRequestDto) => void;
  showCancel?: boolean;
  showArrived?: boolean;
  mapHeight?: string | number;
};

type LatLng = { lat: number; lng: number };

function fitMapToContent(
  map: google.maps.Map,
  request: DispatchRequestDto,
  routePath: LatLng[],
): void {
  const bounds = new google.maps.LatLngBounds();
  bounds.extend({ lat: request.pickup.lat, lng: request.pickup.lng });

  if (request.ambulanceLocation) {
    bounds.extend({
      lat: request.ambulanceLocation.lat,
      lng: request.ambulanceLocation.lng,
    });
  }

  for (const point of routePath) {
    bounds.extend(point);
  }

  map.fitBounds(bounds, 48);
}

export function DispatchTrackingMap({
  requestId,
  role,
  onRequestUpdate,
  showCancel = role === "client",
  showArrived = role === "provider",
  mapHeight = defaultMapHeight,
}: Props) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [request, setRequest] = useState<DispatchRequestDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const isProgrammaticMoveRef = useRef(false);

  useEffect(() => {
    setUserHasInteracted(false);
    mapRef.current = null;
  }, [requestId]);

  const applyMapFrame = useCallback(
    (map: google.maps.Map, data: DispatchRequestDto, path: LatLng[]) => {
      isProgrammaticMoveRef.current = true;
      fitMapToContent(map, data, path);
      google.maps.event.addListenerOnce(map, "idle", () => {
        isProgrammaticMoveRef.current = false;
      });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const data = await fetchDispatchRequest(requestId);
        if (cancelled) {
          return;
        }
        setRequest(data);
        onRequestUpdate?.(data);
        setError(null);

        if (!isActiveDispatchStatus(data.status) && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    }

    void load();
    intervalId = setInterval(() => {
      void load();
    }, 4000);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [requestId, onRequestUpdate]);

  const routePath = useMemo(() => {
    if (!request?.route?.polyline) {
      return [];
    }
    return decodePolyline(request.route.polyline);
  }, [request?.route?.polyline]);

  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: mapHeight,
      borderRadius: "12px",
    }),
    [mapHeight],
  );

  const initialCenter = request
    ? { lat: request.pickup.lat, lng: request.pickup.lng }
    : DEFAULT_MAP_CENTER;

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (request) {
        applyMapFrame(map, request, routePath);
      }
    },
    [request, routePath, applyMapFrame],
  );

  useEffect(() => {
    if (!mapRef.current || !request || userHasInteracted) {
      return;
    }
    applyMapFrame(mapRef.current, request, routePath);
  }, [request, routePath, userHasInteracted, applyMapFrame]);

  function handleRecenter() {
    if (!mapRef.current || !request) {
      return;
    }
    setUserHasInteracted(false);
    applyMapFrame(mapRef.current, request, routePath);
  }

  function handleUserMapChange() {
    if (!isProgrammaticMoveRef.current) {
      setUserHasInteracted(true);
    }
  }

  async function handleCancel() {
    if (!request) {
      return;
    }
    setActionLoading(true);
    try {
      const updated = await cancelDispatchRequest(request.id);
      setRequest(updated);
      onRequestUpdate?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (!request && !error) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (error && !request) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!request) {
    return null;
  }

  const mapProps = userHasInteracted
    ? {}
    : { center: initialCenter, zoom: 14 as const };

  return (
    <div className="space-y-4">
      <DispatchStatusBanner status={request.status} />

      {request.assignedService && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">
            {request.assignedService.title}
          </p>
          <p className="text-slate-600">{request.assignedService.providerName}</p>
        </div>
      )}

      {request.pickup.address && (
        <p className="text-sm text-slate-600">
          Pickup: {request.pickup.address}
        </p>
      )}

      {request.contactPhone && (
        <p className="text-sm text-slate-700">
          Call on arrival:{" "}
          <a
            href={`tel:${request.contactPhone}`}
            className="font-medium text-blue-700 underline-offset-2 hover:underline"
          >
            {request.contactPhone}
          </a>
        </p>
      )}

      {request.route && (
        <p className="text-sm text-slate-600">
          ETA {formatDuration(request.route.durationSeconds)} ·{" "}
          {formatDistance(request.route.distanceMeters)}
        </p>
      )}

      {loadError && (
        <p className="text-sm text-amber-700">Map unavailable — check API key.</p>
      )}

      {!isLoaded && !loadError && (
        <div
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
          style={mapContainerStyle}
        >
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="sr-only">Loading map</span>
        </div>
      )}

      {isLoaded && !loadError && (
        <div className="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            {...mapProps}
            onLoad={handleMapLoad}
            onDragStart={handleUserMapChange}
            onZoomChanged={handleUserMapChange}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            <Marker
              position={{ lat: request.pickup.lat, lng: request.pickup.lng }}
              label="P"
              title="Pickup"
            />
            {request.ambulanceLocation && (
              <Marker
                position={{
                  lat: request.ambulanceLocation.lat,
                  lng: request.ambulanceLocation.lng,
                }}
                label="A"
                title="Ambulance"
              />
            )}
            {routePath.length > 0 && (
              <Polyline
                path={routePath}
                options={{
                  strokeColor: "#2563eb",
                  strokeWeight: 4,
                  strokeOpacity: 0.85,
                }}
              />
            )}
          </GoogleMap>
          <button
            type="button"
            onClick={handleRecenter}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <LocateFixed className="h-3.5 w-3.5" aria-hidden />
            Show full route
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {showCancel && isClientCancellableStatus(request.status) && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleCancel()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {request.status === "no_provider" || request.status === "expired"
              ? "Dismiss request"
              : "Cancel request"}
          </button>
        )}
        {showArrived &&
          (request.status === "accepted" || request.status === "en_route") && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={async () => {
                setActionLoading(true);
                try {
                  const updated = await markDispatchArrived(request.id);
                  setRequest(updated);
                  onRequestUpdate?.(updated);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed");
                } finally {
                  setActionLoading(false);
                }
              }}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Mark arrived
            </button>
          )}
      </div>
    </div>
  );
}
