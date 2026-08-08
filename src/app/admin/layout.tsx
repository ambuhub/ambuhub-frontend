import type { Metadata } from "next";
import { AdminChrome } from "@/components/admin/AdminChrome";
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
  return <AdminChrome>{children}</AdminChrome>;
}
