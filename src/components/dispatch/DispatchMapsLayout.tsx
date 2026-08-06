"use client";

import { GoogleMapsProvider } from "@/components/dispatch/GoogleMapsProvider";

export function DispatchMapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
