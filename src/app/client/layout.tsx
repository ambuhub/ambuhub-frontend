import type { Metadata } from "next";
import { ClientShell } from "@/components/client/ClientShell";

export const metadata: Metadata = {
  title: "Client | Ambuhub",
  description: "Your Ambuhub client dashboard, orders, and saved activity.",
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientShell>{children}</ClientShell>;
}
