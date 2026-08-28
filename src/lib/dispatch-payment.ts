import { API_PROXY_PREFIX } from "@/lib/api";
import type { DispatchRequestDto } from "@/lib/dispatch";
import {
  openPaystackPopup,
  type PaystackInitializeClient,
} from "@/lib/paystack-checkout";

async function postDispatchPaymentCancel(
  requestId: string,
  reference: string,
): Promise<void> {
  await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/payment/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    },
  );
}

export async function initializeDispatchPayment(
  requestId: string,
): Promise<PaystackInitializeClient> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/payment/initialize`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = (await res.json()) as {
    payment?: PaystackInitializeClient;
    message?: string;
  };
  if (!res.ok || !data.payment) {
    throw new Error(data.message ?? "Could not start payment");
  }
  return data.payment;
}

export async function verifyDispatchPayment(
  requestId: string,
  reference: string,
): Promise<{ request: DispatchRequestDto; message: string }> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/payment/verify`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Payment verification failed");
  }
  return {
    request: data.request,
    message: data.message ?? "",
  };
}

export async function runDispatchPaymentCheckout(
  requestId: string,
): Promise<{ request: DispatchRequestDto; message: string }> {
  const payment = await initializeDispatchPayment(requestId);
  const reference = await openPaystackPopup(payment, (ref) =>
    postDispatchPaymentCancel(requestId, ref),
  );
  return verifyDispatchPayment(requestId, reference);
}
