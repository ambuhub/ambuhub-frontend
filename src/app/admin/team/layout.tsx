import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Team",
  "Manage Ambuhub admin team members.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
