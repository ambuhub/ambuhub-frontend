import type { Metadata } from "next";
import { ProviderSubscriptionPlans } from "@/components/provider/ProviderSubscriptionPlans";

export const metadata: Metadata = {
  title: "Subscription | Ambuhub",
  description: "Choose and manage your Ambuhub provider subscription plan.",
};

export default function ProviderSubscriptionPage() {
  return <ProviderSubscriptionPlans />;
}
