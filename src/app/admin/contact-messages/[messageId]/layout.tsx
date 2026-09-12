import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Contact message",
  "View a contact form message.",
);

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
