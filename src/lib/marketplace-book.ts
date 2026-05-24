import { API_PROXY_PREFIX } from "@/lib/api";
import { gapMinutesToHours } from "@/lib/booking-gap";
import type { BookingWindow } from "@/lib/booking-window";
import type {
  HourlyBookingDayDto,
  HourlyBookingSchedule,
} from "@/lib/hourly-booking-schedule";
import type { OrderDetailClient } from "@/lib/marketplace-cart";
import type { PricingPeriod } from "@/lib/pricing-period";

export type { HourlyBookingDayDto };

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export type BookingAvailabilityResponse = {
  bookingWindow: BookingWindow | null;
  hourlyBookingSchedule?: HourlyBookingSchedule | null;
  bookingGapMinutes: number;
  bookingGapHours: number;
  price: number | null;
  pricingPeriod: PricingPeriod | null;
  busyIntervals: { start: string; end: string }[];
  freeRanges: { start: string; end: string }[];
  days?: HourlyBookingDayDto[];
};

export async function fetchBookingAvailability(
  serviceId: string,
  from: string,
  to: string,
): Promise<BookingAvailabilityResponse> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(
    proxyUrl(
      `services/marketplace/${encodeURIComponent(serviceId)}/booking-availability?${params}`,
    ),
    { credentials: "omit" },
  );
  const data = (await res.json()) as BookingAvailabilityResponse & { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load availability");
  }
  if (typeof data.bookingGapHours !== "number") {
    data.bookingGapHours = gapMinutesToHours(data.bookingGapMinutes ?? 0);
  }
  return data;
}

export async function patchBookingSettings(
  serviceId: string,
  payload: {
    bookingWindow?: BookingWindow;
    hourlyBookingSchedule?: HourlyBookingSchedule;
    bookingGapHours?: number;
    /** @deprecated Use bookingGapHours */
    bookingGapMinutes?: number;
    price?: number | null;
    pricingPeriod?: PricingPeriod | null;
    isAvailable?: boolean;
  },
): Promise<void> {
  const res = await fetch(
    proxyUrl(`services/me/${encodeURIComponent(serviceId)}/booking-settings`),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const data = (await res.json()) as { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not save booking settings");
  }
}

export async function postBookSimulateCheckout(payload: {
  serviceId: string;
  bookStart: string;
  bookEnd: string;
}): Promise<{ order: OrderDetailClient; message: string }> {
  const res = await fetch(proxyUrl("orders/book-checkout/simulate-paystack"), {
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
      "You need to be logged in to complete booking checkout. Log in and try again.",
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
