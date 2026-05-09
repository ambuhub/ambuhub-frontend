import { API_PROXY_PREFIX } from "@/lib/api";
import type { PublicAuthUser } from "@/lib/auth-redirect";

export type CartLineClient = {
  serviceId: string;
  quantity: number;
  title: string;
  listingType: "sale" | "hire" | "book" | null;
  stock: number | null;
  price: number | null;
  departmentSlug: string;
  departmentName: string;
  category: { slug: string; name: string };
  photoUrls: string[];
  lineTotalNgn: number | null;
};

export type CartClient = { items: CartLineClient[] };

export async function fetchAuthMe(): Promise<{
  user: PublicAuthUser | null;
  ok: boolean;
}> {
  let res: Response;
  try {
    res = await fetch("/api/auth/me", {
      credentials: "include",
    });
  } catch {
    return { user: null, ok: false };
  }
  if (res.status === 401) {
    return { user: null, ok: false };
  }
  if (!res.ok) {
    return { user: null, ok: false };
  }
  try {
    const data = (await res.json()) as { user?: PublicAuthUser };
    return { user: data.user ?? null, ok: true };
  } catch {
    return { user: null, ok: false };
  }
}

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export async function fetchCart(): Promise<CartClient> {
  const res = await fetch(proxyUrl("cart"), { credentials: "include" });
  if (!res.ok) {
    return { items: [] };
  }
  const data = (await res.json()) as { cart?: CartClient };
  return data.cart ?? { items: [] };
}

export async function postCartItem(
  serviceId: string,
  quantity?: number,
): Promise<CartClient> {
  const res = await fetch(proxyUrl("cart/items"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceId, quantity }),
  });
  let data: { cart?: CartClient; message?: string } = {};
  try {
    data = (await res.json()) as { cart?: CartClient; message?: string };
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    throw new Error(
      "You need to be logged in to add items to your cart. Use Log in, then try again.",
    );
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not add to cart");
  }
  return data.cart ?? { items: [] };
}

export async function patchCartItemQuantity(
  serviceId: string,
  quantity: number,
): Promise<CartClient> {
  const res = await fetch(proxyUrl(`cart/items/${encodeURIComponent(serviceId)}`), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  let data: { cart?: CartClient; message?: string } = {};
  try {
    data = (await res.json()) as { cart?: CartClient; message?: string };
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not update cart");
  }
  return data.cart ?? { items: [] };
}

export async function deleteCartItem(serviceId: string): Promise<CartClient> {
  const res = await fetch(proxyUrl(`cart/items/${encodeURIComponent(serviceId)}`), {
    method: "DELETE",
    credentials: "include",
  });
  let data: { cart?: CartClient; message?: string } = {};
  try {
    data = (await res.json()) as { cart?: CartClient; message?: string };
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not remove item");
  }
  return data.cart ?? { items: [] };
}

export type OrderLineClient = {
  serviceId: string;
  lineKind?: "sale" | "hire";
  title: string;
  unitPriceNgn: number;
  quantity: number;
  lineTotalNgn: number;
  categoryName: string;
  categorySlug: string;
  departmentName: string;
  hireStart?: string;
  hireEnd?: string;
  pricingPeriod?: string;
  hireBillableUnits?: number;
};

export type OrderDetailClient = {
  id: string;
  receiptNumber: string;
  currency: string;
  subtotalNgn: number;
  lines: OrderLineClient[];
  paymentProvider: string;
  paystackReference: string;
  paystackSimulated: boolean;
  paidAt: string;
  createdAt: string;
};

export async function postSimulateCheckout(): Promise<{
  order: OrderDetailClient;
  message: string;
}> {
  const res = await fetch(proxyUrl("orders/checkout/simulate-paystack"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = (await res.json()) as {
    order?: OrderDetailClient;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Checkout failed");
  }
  if (!data.order) {
    throw new Error("Checkout returned no order");
  }
  return { order: data.order, message: data.message ?? "" };
}

export type ReceiptLineClient = {
  serviceId: string;
  lineKind?: "sale" | "hire";
  title: string;
  unitPriceNgn: number;
  quantity: number;
  lineTotalNgn: number;
  categoryName: string;
  departmentName: string;
  hireStart?: string;
  hireEnd?: string;
  pricingPeriod?: string;
  hireBillableUnits?: number;
};

export type ReceiptDetailClient = {
  id: string;
  orderId: string;
  receiptNumber: string;
  currency: string;
  subtotalNgn: number;
  lines: ReceiptLineClient[];
  paymentProvider: string;
  paystackReference: string;
  issuedAt: string;
};

export async function fetchReceiptByOrderId(
  orderId: string,
): Promise<ReceiptDetailClient> {
  const res = await fetch(
    proxyUrl(`receipts/me/by-order/${encodeURIComponent(orderId)}`),
    { credentials: "include" },
  );
  const data = (await res.json()) as { receipt?: ReceiptDetailClient; message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "Receipt not found");
  }
  if (!data.receipt) {
    throw new Error("Receipt not found");
  }
  return data.receipt;
}
