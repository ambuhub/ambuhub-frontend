"use client";

import { BookingWindowFields } from "@/components/provider/BookingWindowFields";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import {
  EMPTY_BOOKING_WINDOW,
  hasValidBookingWindow,
  type BookingWindow,
} from "@/lib/booking-window";
import { patchBookingSettings } from "@/lib/marketplace-book";
import {
  PRICING_PERIODS,
  formatPricingPeriodLabel,
  isPricingPeriod,
  type PricingPeriod,
} from "@/lib/pricing-period";
import { useCallback, useEffect, useState } from "react";

type ServiceRow = {
  id: string;
  title: string;
  listingType: "sale" | "hire" | "book" | null;
  price?: number | null;
  pricingPeriod?: PricingPeriod | null;
  bookingWindow?: BookingWindow | null;
  bookingGapMinutes?: number | null;
};

type Props = {
  item: ServiceRow;
  onSaved?: () => void;
};

export function BookingScheduleCard({ item, onSaved }: Props) {
  const [bookingWindow, setBookingWindow] = useState<BookingWindow>(
    item.bookingWindow ?? EMPTY_BOOKING_WINDOW,
  );
  const [gapMinutes, setGapMinutes] = useState(
    String(item.bookingGapMinutes ?? 0),
  );
  const [price, setPrice] = useState(
    item.price != null ? String(item.price) : "",
  );
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod | "">(
    item.pricingPeriod && isPricingPeriod(item.pricingPeriod)
      ? item.pricingPeriod
      : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setBookingWindow(item.bookingWindow ?? EMPTY_BOOKING_WINDOW);
    setGapMinutes(String(item.bookingGapMinutes ?? 0));
    setPrice(item.price != null ? String(item.price) : "");
    setPricingPeriod(
      item.pricingPeriod && isPricingPeriod(item.pricingPeriod)
        ? item.pricingPeriod
        : "",
    );
  }, [item]);

  const ready =
    hasValidBookingWindow(bookingWindow) &&
    price.trim() !== "" &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0 &&
    pricingPeriod !== "" &&
    isPricingPeriod(pricingPeriod);

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
    if (!pricingPeriod || !isPricingPeriod(pricingPeriod)) {
      setError("Select a pricing period.");
      return;
    }
    const gap = parseInt(gapMinutes, 10);
    if (!Number.isInteger(gap) || gap < 0) {
      setError("Gap between bookings must be a non-negative integer (minutes).");
      return;
    }
    setSaving(true);
    try {
      await patchBookingSettings(item.id, {
        bookingWindow,
        bookingGapMinutes: gap,
        price: parsedPrice,
        pricingPeriod,
      });
      setSuccess(true);
      window.dispatchEvent(new CustomEvent(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [bookingWindow, gapMinutes, price, pricingPeriod, item.id, onSaved]);

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
      <div className="mt-4 space-y-4">
        <BookingWindowFields value={bookingWindow} onChange={setBookingWindow} />
        <div>
          <label className="block text-sm font-semibold text-slate-800">
            Gap between bookings (minutes)
          </label>
          <p className="mt-0.5 text-xs text-slate-600">
            Minimum time required after one booking ends before another can start.
          </p>
          <input
            type="number"
            min={0}
            max={1440}
            value={gapMinutes}
            onChange={(e) => setGapMinutes(e.target.value)}
            className="mt-1.5 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Price (₦)
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Billing period
            </label>
            <select
              value={pricingPeriod}
              onChange={(e) =>
                setPricingPeriod(
                  isPricingPeriod(e.target.value) ? e.target.value : "",
                )
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select period</option>
              {PRICING_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {formatPricingPeriodLabel(p)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-700">Booking settings saved.</p>
        ) : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save booking settings"}
        </button>
      </div>
    </div>
  );
}
