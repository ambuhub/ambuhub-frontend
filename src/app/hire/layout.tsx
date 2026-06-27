import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Hire",
  "Hire equipment or personnel on Ambuhub.",
);

export default function HireLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
