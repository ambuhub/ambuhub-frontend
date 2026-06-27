import type { Metadata } from "next";
import { ProviderSubscriptionPlans } from "@/components/provider/ProviderSubscriptionPlans";
import { privatePageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = privatePageMetadata(
  "Subscription",
  "Choose and manage your Ambuhub provider subscription plan.",
);

export default function ProviderSubscriptionPage() {
  return <ProviderSubscriptionPlans />;
}
