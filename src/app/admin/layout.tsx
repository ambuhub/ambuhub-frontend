import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Admin",
  "Ambuhub platform administration.",
);

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
