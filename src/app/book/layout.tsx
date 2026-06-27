import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Book service",
  "Book ambulance coverage or personnel on Ambuhub.",
);

export default function BookLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
