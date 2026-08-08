import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Admin sign in",
  "Sign in to the Ambuhub admin portal.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
