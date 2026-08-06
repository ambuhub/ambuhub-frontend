"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const LOADER_ID = "ambuhub-google-maps";

type GoogleMapsContextValue = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: undefined,
});

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

function GoogleMapsProviderInner({
  apiKey,
  children,
}: {
  apiKey: string;
  children: ReactNode;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries,
  });

  return (
    <GoogleMapsContext.Provider
      value={{ isLoaded, loadError: loadError ?? undefined }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!apiKey) {
    return (
      <GoogleMapsContext.Provider
        value={{ isLoaded: false, loadError: new Error("Maps API key missing") }}
      >
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <GoogleMapsProviderInner apiKey={apiKey}>{children}</GoogleMapsProviderInner>
  );
}

export const DEFAULT_MAP_CENTER = { lat: 6.5244, lng: 3.3792 };
