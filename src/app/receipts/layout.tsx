import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Receipt",
  "View your Ambuhub order receipt.",
);

export default function ReceiptsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
