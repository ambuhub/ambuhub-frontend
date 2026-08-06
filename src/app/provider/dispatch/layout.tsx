import type { Metadata } from "next";
import { DispatchMapsLayout } from "@/components/dispatch/DispatchMapsLayout";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Dispatch",
  "Manage on-duty status and respond to ambulance dispatch requests.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DispatchMapsLayout>{children}</DispatchMapsLayout>;
}
