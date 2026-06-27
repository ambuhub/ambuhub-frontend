import type { Metadata } from "next";
import { ProviderShell } from "@/components/provider/ProviderShell";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Provider",
  "Manage your Ambuhub provider listings, bookings, and profile.",
);

export default function ProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProviderShell>{children}</ProviderShell>;
}
