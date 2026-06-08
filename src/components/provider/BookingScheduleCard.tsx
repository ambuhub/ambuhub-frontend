"use client";

import { BookingWindowFields } from "@/components/provider/BookingWindowFields";
import { DailyScheduleOverridesEditor } from "@/components/provider/DailyScheduleOverridesEditor";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import {
  EMPTY_BOOKING_WINDOW,
  hasValidBookingWindow,
  type BookingWindow,
} from "@/lib/booking-window";
import {
  currencyForCountry,
  getCurrencySymbol,
  parseSupportedCurrency,
} from "@/lib/currency";
import {
  validateHourlyScheduleClient,
  type HourlyBookingSchedule,
  type HourlyScheduleOverride,
} from "@/lib/hourly-booking-schedule";
import { patchBookingSettings } from "@/lib/marketplace-book";
import { LISTING_PRICING_PERIOD } from "@/lib/pricing-period";
import { useCallback, useEffect, useMemo, useState } from "react";

type ServiceRow = {
  id: string;
  title: string;
  listingType: "sale" | "hire" | "book" | null;
  price?: number | null;
  currency?: string | null;
  countryCode?: string | null;
  bookingWindow?: BookingWindow | null;
  hourlyBookingSchedule?: HourlyBookingSchedule | null;
};

type Props = {
  item: ServiceRow;
  onSaved?: () => void;
};

export function BookingScheduleCard({ item, onSaved }: Props) {
  const [bookingWindow, setBookingWindow] = useState<BookingWindow>(
    item.bookingWindow ?? EMPTY_BOOKING_WINDOW,
  );
  const [overrides, setOverrides] = useState<HourlyScheduleOverride[]>(
    item.hourlyBookingSchedule?.overrides ?? [],
  );
  const [price, setPrice] = useState(item.price != null ? String(item.price) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setBookingWindow(item.bookingWindow ?? EMPTY_BOOKING_WINDOW);
    setOverrides(item.hourlyBookingSchedule?.overrides ?? []);
    setPrice(item.price != null ? String(item.price) : "");
  }, [item]);

  const listingCurrency = useMemo(
    () =>
      item.currency
        ? parseSupportedCurrency(item.currency)
        : currencyForCountry(item.countryCode),
    [item.countryCode, item.currency],
  );

  const ready =
    hasValidBookingWindow(bookingWindow) &&
    price.trim() !== "" &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0;

  const schedule = useMemo<HourlyBookingSchedule>(
    () => ({ default: bookingWindow, overrides }),
    [bookingWindow, overrides],
  );

  const save = useCallback(async () => {
    setError(null);
    setSuccess(false);
    if (!hasValidBookingWindow(bookingWindow)) {
      setError("Select at least one day and valid start/end times.");
      return;
    }
    const parsedPrice = Number(price);
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid price.");
      return;
    }
    const validation = validateHourlyScheduleClient(schedule);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    try {
      await patchBookingSettings(item.id, {
        bookingWindow,
        hourlyBookingSchedule: schedule,
        price: parsedPrice,
        pricingPeriod: LISTING_PRICING_PERIOD,
      });
      setSuccess(true);
      window.dispatchEvent(new CustomEvent(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [bookingWindow, schedule, price, item.id, onSaved]);

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-cyan-950">Booking schedule</p>
        {ready ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Ready for booking
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            Incomplete
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Bookings are billed daily ({LISTING_PRICING_PERIOD} rate).
      </p>
      <div className="mt-4 space-y-4">
        <BookingWindowFields value={bookingWindow} onChange={setBookingWindow} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Price ({getCurrencySymbol(listingCurrency)})
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">Per day</p>
          </div>
        </div>
        {ready ? (
          <DailyScheduleOverridesEditor overrides={overrides} onChange={setOverrides} />
        ) : null}
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-800" role="status">
            Saved.
          </p>
        ) : null}
        <button
          type="button"
          disabled={saving || !ready}
          onClick={() => void save()}
          className="rounded-xl bg-cyan-800 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-900 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save schedule"}
        </button>
      </div>
    </div>
  );
}
