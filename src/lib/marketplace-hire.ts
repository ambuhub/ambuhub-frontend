import { API_PROXY_PREFIX } from "@/lib/api";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";
import type { OrderDetailClient } from "@/lib/marketplace-cart";

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export async function fetchMarketplaceServiceById(
  serviceId: string,
): Promise<MarketplaceServiceRow | null> {
  const trimmed = serviceId?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  const res = await fetch(proxyUrl(`services/marketplace/${encodeURIComponent(trimmed)}`), {
    credentials: "omit",
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Could not load listing");
  }
  const data = (await res.json()) as { service?: MarketplaceServiceRow; message?: string };
  return data.service ?? null;
}

export async function postHireSimulateCheckout(payload: {
  serviceId: string;
  quantity: number;
  hireStart: string;
  hireEnd: string;
}): Promise<{ order: OrderDetailClient; message: string }> {
  const res = await fetch(proxyUrl("orders/hire-checkout/simulate-paystack"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    order?: OrderDetailClient;
    message?: string;
  };
  if (res.status === 401) {
    throw new Error(
      "You need to be logged in to complete hire checkout. Log in and try again.",
    );
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Checkout failed");
  }
  if (!data.order) {
    throw new Error("Checkout returned no order");
  }
  return { order: data.order, message: data.message ?? "" };
}
