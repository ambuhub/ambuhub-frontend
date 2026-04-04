import type { Metadata } from "next";
import { ProviderShell } from "@/components/provider/ProviderShell";

export const metadata: Metadata = {
  title: "Provider | Ambuhub",
  description: "Manage your Ambuhub provider listings, bookings, and profile.",
};

export default function ProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProviderShell>{children}</ProviderShell>;
}
