import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Activity logs",
  "Review Ambuhub admin activity history.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
