"use client";

import { Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_MAP_CENTER,
  useGoogleMaps,
} from "@/components/dispatch/GoogleMapsProvider";

export type DispatchLocationValue = {
  locationSource: "current_location" | "address";
  latitude: number;
  longitude: number;
  address: string | null;
};

type Props = {
  value: DispatchLocationValue | null;
  onChange: (value: DispatchLocationValue) => void;
};

const mapContainerStyle = { width: "100%", height: "280px", borderRadius: "12px" };

export function DispatchLocationPicker({ value, onChange }: Props) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [mode, setMode] = useState<"current_location" | "address">(
    value?.locationSource ?? "current_location",
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const useCurrentLocation = useCallback(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({
          locationSource: "current_location",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: null,
        });
      },
      () => {
        setLocating(false);
        setLocationError("Could not get your location. Allow location access or enter an address.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [onChange]);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) {
      return;
    }
    onChange({
      locationSource: "address",
      latitude: loc.lat(),
      longitude: loc.lng(),
      address: place.formatted_address ?? place.name ?? null,
    });
  }, [onChange]);

  const center = value
    ? { lat: value.latitude, lng: value.longitude }
    : DEFAULT_MAP_CENTER;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("current_location");
            useCurrentLocation();
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "current_location"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Navigation className="h-4 w-4" aria-hidden />
          )}
          Use my location
        </button>
        <button
          type="button"
          onClick={() => setMode("address")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "address"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MapPin className="h-4 w-4" aria-hidden />
          Enter address
        </button>
      </div>

      {mode === "address" && isLoaded && (
        <Autocomplete
          onLoad={(ac) => {
            autocompleteRef.current = ac;
          }}
          onPlaceChanged={onPlaceChanged}
          restrictions={{ country: ["ng", "gh"] }}
        >
          <input
            type="text"
            placeholder="Search for an address…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
          />
        </Autocomplete>
      )}

      {locationError && (
        <p className="text-sm text-red-600" role="alert">
          {locationError}
        </p>
      )}

      {loadError && (
        <p className="text-sm text-amber-700" role="alert">
          Google Maps could not load. Check your API key configuration.
        </p>
      )}

      {isLoaded && !loadError && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={value ? 15 : 11}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {value && (
            <Marker
              position={{ lat: value.latitude, lng: value.longitude }}
              title="Pickup location"
            />
          )}
        </GoogleMap>
      )}

      {value?.address && (
        <p className="text-sm text-slate-600">{value.address}</p>
      )}
      {value && !value.address && mode === "current_location" && (
        <p className="text-sm text-slate-600">
          Using your current coordinates ({value.latitude.toFixed(5)},{" "}
          {value.longitude.toFixed(5)})
        </p>
      )}
    </div>
  );
}
