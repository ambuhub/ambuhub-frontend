import type { Metadata } from "next";
import { DispatchMapsLayout } from "@/components/dispatch/DispatchMapsLayout";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Request Ambulance",
  "Request emergency ground ambulance dispatch on Ambuhub.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DispatchMapsLayout>{children}</DispatchMapsLayout>;
}
