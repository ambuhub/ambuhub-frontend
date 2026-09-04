import type { Metadata } from "next";
import { ProviderWalletLedger } from "./ProviderWalletLedger";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Wallet",
  "Review your Ambuhub wallet balance and payout history.",
);

export default function ProviderWalletPage() {
  return <ProviderWalletLedger />;
}
