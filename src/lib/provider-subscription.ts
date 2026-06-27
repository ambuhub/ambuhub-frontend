import { API_PROXY_PREFIX } from "@/lib/api";
import type { SubscriptionBillingInterval } from "@/lib/provider-subscription-plans";
import type { PaystackInitializeClient } from "@/lib/paystack-checkout";

export type ProviderSubscriptionStatus = {
  plan: "free" | "premium";
  interval: SubscriptionBillingInterval | null;
  expiresAt: string | null;
  isActive: boolean;
};

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export async function fetchProviderSubscription(): Promise<ProviderSubscriptionStatus> {
  const res = await fetch(proxyUrl("provider/subscription"), {
    credentials: "include",
  });
  const data = (await res.json()) as {
    subscription?: ProviderSubscriptionStatus;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load subscription");
  }
  if (!data.subscription) {
    throw new Error("Subscription data is missing");
  }
  return data.subscription;
}

export async function postPremiumSubscriptionInitialize(
  interval: SubscriptionBillingInterval,
): Promise<{ payment: PaystackInitializeClient }> {
  const res = await fetch(proxyUrl("provider/subscription/paystack/initialize"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const data = (await res.json()) as {
    payment?: PaystackInitializeClient;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not start checkout");
  }
  if (!data.payment) {
    throw new Error("Checkout payment data is missing");
  }
  return { payment: data.payment };
}

export async function postPremiumSubscriptionVerify(
  reference: string,
): Promise<{ subscription: ProviderSubscriptionStatus; message: string }> {
  const res = await fetch(proxyUrl("provider/subscription/paystack/verify"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
  const data = (await res.json()) as {
    subscription?: ProviderSubscriptionStatus;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Payment verification failed");
  }
  if (!data.subscription) {
    throw new Error("Subscription data is missing after payment");
  }
  return {
    subscription: data.subscription,
    message: data.message ?? "",
  };
}

export async function postPremiumSubscriptionCancel(reference: string): Promise<void> {
  await fetch(proxyUrl("provider/subscription/paystack/cancel"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
}
