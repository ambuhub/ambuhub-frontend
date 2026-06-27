"use client";

import { Crown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchProviderSubscription } from "@/lib/provider-subscription";

export const PROVIDER_SUBSCRIPTION_UPDATED_EVENT =
  "ambuhub:provider-subscription-updated";

export function ProviderPremiumBadge() {
  const [isPremium, setIsPremium] = useState(false);

  const loadPremiumStatus = useCallback(async () => {
    try {
      const subscription = await fetchProviderSubscription();
      setIsPremium(subscription.isActive && subscription.plan === "premium");
    } catch {
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    void loadPremiumStatus();

    function onSubscriptionUpdated() {
      void loadPremiumStatus();
    }

    window.addEventListener(PROVIDER_SUBSCRIPTION_UPDATED_EVENT, onSubscriptionUpdated);
    return () => {
      window.removeEventListener(
        PROVIDER_SUBSCRIPTION_UPDATED_EVENT,
        onSubscriptionUpdated,
      );
    };
  }, [loadPremiumStatus]);

  if (!isPremium) {
    return null;
  }

  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-md shadow-amber-900/40 ring-2 ring-amber-200/80"
      title="Premium provider"
      aria-label="Premium provider"
    >
      <Crown className="h-3.5 w-3.5 text-amber-950" aria-hidden />
    </span>
  );
}
