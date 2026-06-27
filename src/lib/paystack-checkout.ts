import { API_PROXY_PREFIX } from "@/lib/api";
import type { OrderDetailClient } from "@/lib/marketplace-cart";

export type PaystackInitializeClient = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  publicKey: string;
  amount: number;
  currency: string;
  email: string;
};

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export async function postPaystackVerify(
  reference: string,
): Promise<{ order: OrderDetailClient; message: string }> {
  const res = await fetch(proxyUrl("orders/paystack/verify"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
  const data = (await res.json()) as {
    order?: OrderDetailClient;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Payment verification failed");
  }
  if (!data.order) {
    throw new Error("Payment verification returned no order");
  }
  return { order: data.order, message: data.message ?? "" };
}

export async function postPaystackCancel(reference: string): Promise<void> {
  await fetch(proxyUrl("orders/paystack/cancel"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
}

export async function postSubscriptionPaystackCancel(reference: string): Promise<void> {
  await fetch(proxyUrl("provider/subscription/paystack/cancel"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
}

function loadPaystackInlineScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.PaystackPop) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Paystack")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

export async function openPaystackPopup(
  payment: PaystackInitializeClient,
  onCancel: (reference: string) => Promise<void> = postPaystackCancel,
): Promise<string> {
  await loadPaystackInlineScript();
  const PaystackPop = window.PaystackPop;
  if (!PaystackPop) {
    throw new Error("Paystack could not be loaded");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const handler = PaystackPop.setup({
      key: payment.publicKey,
      email: payment.email,
      amount: payment.amount,
      ref: payment.reference,
      currency: payment.currency,
      callback: (response: { reference?: string }) => {
        if (settled) {
          return;
        }
        settled = true;
        const ref = response.reference?.trim() || payment.reference;
        resolve(ref);
      },
      onClose: () => {
        if (settled) {
          return;
        }
        settled = true;
        void onCancel(payment.reference);
        reject(new Error("Payment window closed"));
      },
    });
    handler.openIframe();
  });
}

export async function runPaystackCheckout(
  initialize: () => Promise<{ payment: PaystackInitializeClient }>,
): Promise<{ order: OrderDetailClient; message: string }> {
  const { payment } = await initialize();
  const reference = await openPaystackPopup(payment);
  return postPaystackVerify(reference);
}

export async function runSubscriptionPaystackCheckout<T>(
  initialize: () => Promise<{ payment: PaystackInitializeClient }>,
  verify: (reference: string) => Promise<T>,
): Promise<T> {
  const { payment } = await initialize();
  const reference = await openPaystackPopup(payment, postSubscriptionPaystackCancel);
  return verify(reference);
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        callback: (response: { reference?: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export {};
