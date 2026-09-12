import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Contact messages",
  "Manage Ambuhub contact form messages.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
