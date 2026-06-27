import type { Metadata } from "next";
import { ClientShell } from "@/components/client/ClientShell";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Client",
  "Your Ambuhub client dashboard, orders, and saved activity.",
);

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientShell>{children}</ClientShell>;
}
