import type { Metadata } from "next";
import { DispatchMapsLayout } from "@/components/dispatch/DispatchMapsLayout";
import { DispatchShell } from "@/components/dispatch/DispatchShell";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Dispatch",
  "Ambuhub dispatch crew dashboard for duty and live requests.",
);

export default function DispatchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DispatchMapsLayout>
      <DispatchShell>{children}</DispatchShell>
    </DispatchMapsLayout>
  );
}
