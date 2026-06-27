"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CheckoutSuccessPanel } from "@/components/checkout/CheckoutSuccessPanel";
import { BookAvailabilityCalendar } from "@/components/book/BookAvailabilityCalendar";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { bookUnavailableReason, isBookBookable } from "@/lib/book-bookable";
import { formatBookingWindowSummary } from "@/lib/booking-window";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import type { PickedFreeSlot } from "@/lib/book-form-datetime";
import {
  bookFormToCheckoutPayload,
  formatBookRangeLabel,
  formValuesMatchPickedSlot,
  freeRangeToFormValues,
  isBookRangeWithinFreeSlots,
  previewBookLineTotal,
} from "@/lib/book-form-datetime";
import {
  countBillableBookDaysInRange,
  enumerateBookDateRange,
  hasBillableDaysInBookRange,
  isOrderedBookDateRange,
  normalizeBookDays,
} from "@/lib/book-availability-calendar";
import type { HourlyBookingDayDto } from "@/lib/hourly-booking-schedule";
import { fetchMarketplaceServiceById } from "@/lib/marketplace-hire";
import {
  fetchBookingAvailability,
  postBookSimulateCheckout,
  type BookingAvailabilityResponse,
} from "@/lib/marketplace-book";
import type { OrderDetailClient } from "@/lib/marketplace-cart";
import { marketplaceCategoryHref } from "@/lib/marketplace-navigation";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  LISTING_PRICING_PERIOD,
} from "@/lib/pricing-period";
import { formatMoney } from "@/lib/currency";
import { getListingCurrency } from "@/lib/marketplace-listing";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

export default function BookCheckoutPage() {
  const params = useParams();
  const serviceId = typeof params?.serviceId === "string" ? params.serviceId : "";
  const { user, loading: sessionLoading } = useSessionAndCart();

  const [service, setService] = useState<MarketplaceServiceRow | null>(null);
  const [availability, setAvailability] = useState<BookingAvailabilityResponse | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");
  const [pickedSlot, setPickedSlot] = useState<PickedFreeSlot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderDetailClient | null>(null);
  const [marketplaceHref, setMarketplaceHref] = useState("/services");

  useEffect(() => {
    if (!serviceId) {
      setLoadingService(false);
      setLoadError("Missing listing.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingService(true);
      setLoadError(null);
      try {
        const svc = await fetchMarketplaceServiceById(serviceId);
        if (cancelled) return;
        if (!svc) {
          setService(null);
          setLoadError("This listing was not found or is not available.");
          return;
        }
        setService(svc);
        const from = new Date();
        const to = new Date(from.getTime() + 30 * 86400000);
        const avail = await fetchBookingAvailability(
          serviceId,
          from.toISOString(),
          to.toISOString(),
        );
        if (!cancelled) {
          setAvailability(avail);
        }
      } catch {
        if (!cancelled) {
          setService(null);
          setLoadError("Could not load this listing.");
        }
      } finally {
        if (!cancelled) {
          setLoadingService(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const period = LISTING_PRICING_PERIOD;

  const bookingWindow =
    service?.bookingWindow ?? availability?.bookingWindow ?? null;

  const calendarDays = useMemo(
    () => normalizeBookDays(availability?.days),
    [availability?.days],
  );

  const rangeOrderInvalid = useMemo(() => {
    if (!bookStart.trim() || !bookEnd.trim()) {
      return false;
    }
    return !isOrderedBookDateRange(bookStart, bookEnd);
  }, [bookStart, bookEnd]);

  const preview = useMemo(() => {
    if (!service || !isBookBookable(service) || rangeOrderInvalid) {
      return null;
    }
    const unit = service.price ?? 0;
    return previewBookLineTotal(
      bookStart,
      bookEnd,
      unit,
      bookingWindow,
      calendarDays.length > 0 ? calendarDays : null,
    );
  }, [service, bookStart, bookEnd, bookingWindow, calendarDays, rangeOrderInvalid]);

  const calendarSpanDays = useMemo(() => {
    if (!bookStart.trim() || !bookEnd.trim()) {
      return 0;
    }
    return enumerateBookDateRange(bookStart, bookEnd).length;
  }, [bookStart, bookEnd]);

  const billableDaysInRange = useMemo(() => {
    if (!bookStart.trim() || !bookEnd.trim() || calendarDays.length === 0) {
      return 0;
    }
    return countBillableBookDaysInRange(bookStart, bookEnd, calendarDays);
  }, [bookStart, bookEnd, calendarDays]);

  const rangeInFree = useMemo(() => {
    if (!availability) {
      return null;
    }
    if (!bookStart.trim() || !bookEnd.trim()) {
      return null;
    }
    if (rangeOrderInvalid) {
      return false;
    }
    if (pickedSlot && formValuesMatchPickedSlot(bookStart, bookEnd, pickedSlot)) {
      return true;
    }

    if (calendarDays.length > 0) {
      return hasBillableDaysInBookRange(bookStart, bookEnd, calendarDays);
    }

    if (!availability.freeRanges.length) {
      return null;
    }
    return isBookRangeWithinFreeSlots(
      bookStart,
      bookEnd,
      availability.freeRanges,
      bookingWindow,
    );
  }, [availability, bookStart, bookEnd, bookingWindow, pickedSlot, calendarDays, rangeOrderInvalid]);

  const hasBookableDays = useMemo(
    () => calendarDays.some((d) => d.freeSlots.length > 0),
    [calendarDays],
  );

  const pickFromFree = useCallback(
    (isoStart: string, isoEnd: string) => {
      const values = freeRangeToFormValues(isoStart, isoEnd);
      if (!values) {
        setError("Could not apply this time slot.");
        return;
      }
      setPickedSlot({ isoStart, isoEnd });
      setBookStart(values.bookStart);
      setBookEnd(values.bookEnd);
      setError(null);
    },
    [],
  );

  const handleDaySelect = useCallback(
    (day: HourlyBookingDayDto) => {
      setError(null);
      const date = day.date;

      if (!bookStart || date < bookStart) {
        if (day.freeSlots.length > 0) {
          const first = day.freeSlots[0];
          const last = day.freeSlots[day.freeSlots.length - 1];
          pickFromFree(first.start, last.end);
        } else {
          setPickedSlot(null);
          setBookStart(date);
          setBookEnd(date);
        }
        return;
      }

      if (date > bookStart) {
        setPickedSlot(null);
        setBookEnd(date);
        return;
      }

      if (day.freeSlots.length > 0) {
        const first = day.freeSlots[0];
        const last = day.freeSlots[day.freeSlots.length - 1];
        pickFromFree(first.start, last.end);
      }
    },
    [bookStart, pickFromFree],
  );

  async function handleCheckout() {
    setError(null);
    if (!service || !isBookBookable(service)) {
      setError("This listing cannot be booked.");
      return;
    }
    if (rangeOrderInvalid) {
      setError("Start date must be on or before end date.");
      return;
    }
    if (!preview) {
      setError("Choose valid booking start and end dates.");
      return;
    }
    if (rangeInFree === false) {
      setError("Selected dates must fall within an available slot.");
      return;
    }
    const payload = bookFormToCheckoutPayload(bookStart, bookEnd, bookingWindow);
    if (!payload) {
      setError("Choose valid booking start and end times.");
      return;
    }
    setBusy(true);
    try {
      const { order } = await postBookSimulateCheckout({
        serviceId: service.id,
        bookStart: payload.bookStart,
        bookEnd: payload.bookEnd,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
      }
      const resolvedSlug = service.category.slug || order.lines[0]?.categorySlug || null;
      setCompletedOrder(order);
      setMarketplaceHref(marketplaceCategoryHref(resolvedSlug));
      setCheckoutComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be completed");
    } finally {
      setBusy(false);
    }
  }

  const loginNext = serviceId ? `/book/${encodeURIComponent(serviceId)}` : "/book";
  const loginHref = `/auth?next=${encodeURIComponent(loginNext)}`;
  const bookable = service ? isBookBookable(service) : false;
  const windowSummary =
    service?.bookingWindow != null
      ? formatBookingWindowSummary(service.bookingWindow)
      : availability?.bookingWindow
        ? formatBookingWindowSummary(availability.bookingWindow)
        : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50/80">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-gradient-to-r from-cyan-50 to-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0c4a6e]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" aria-hidden />
            Book checkout
          </span>

          {loadingService ? (
            <p className="mt-8 flex items-center gap-2 text-foreground/70">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Loading listing…
            </p>
          ) : checkoutComplete && completedOrder ? (
            <CheckoutSuccessPanel
              receiptNumber={completedOrder.receiptNumber}
              marketplaceHref={marketplaceHref}
            />
          ) : loadError ? (
            <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {loadError}
            </p>
          ) : service ? (
            <>
              <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                {service.title}
              </h1>
              <p className="mt-1 text-sm text-foreground/70">
                {service.departmentName} ·{" "}
                {formatPricingPeriodLabel(period)}
                {typeof service.price === "number"
                  ? ` · ${formatMoney(service.price, getListingCurrency(service))} ${formatHirePricePeriodSuffix(period)}`
                  : null}
              </p>

              {!bookable ? (
                <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  {bookUnavailableReason(service)}
                </p>
              ) : (
                <div className="mt-8 space-y-6">
                  {windowSummary ? (
                    <p className="flex items-start gap-2 text-sm text-foreground/80">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                      <span>
                        <strong className="font-semibold">Weekly hours:</strong>{" "}
                        {windowSummary}
                        {availability && (availability.bookingGapHours ?? 0) > 0
                          ? ` · ${availability.bookingGapHours}h buffer after each booking`
                          : null}
                      </span>
                    </p>
                  ) : null}

                  <>
                      {availability && hasBookableDays ? (
                        <BookAvailabilityCalendar
                          days={calendarDays}
                          bookStart={bookStart}
                          bookEnd={bookEnd}
                          onDaySelect={handleDaySelect}
                        />
                      ) : (
                        <p className="text-sm text-foreground/60">
                          No open days in the next 30 days. Try another listing or check
                          back later.
                        </p>
                      )}

                      <div className="rounded-2xl border border-cyan-200/60 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-foreground">
                          Your booking
                        </h2>
                        <p className="mt-1 text-xs text-foreground/60">
                          Dates use the provider’s booking calendar (WAT). Select days on
                          the calendar above, or enter start and end dates below.
                        </p>
                        {pickedSlot ? (
                          <p className="mt-2 text-xs font-medium text-cyan-900/80">
                            One day selected — provider hours (
                            {formatBookRangeLabel(pickedSlot.isoStart)} –{" "}
                            {formatBookRangeLabel(pickedSlot.isoEnd)}) apply on that date.
                          </p>
                        ) : null}
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700">
                              Start date
                            </label>
                            <input
                              type="date"
                              value={bookStart}
                              onChange={(e) => {
                                setError(null);
                                setPickedSlot(null);
                                setBookStart(e.target.value);
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700">
                              End date
                            </label>
                            <input
                              type="date"
                              value={bookEnd}
                              onChange={(e) => {
                                setError(null);
                                setPickedSlot(null);
                                setBookEnd(e.target.value);
                              }}
                              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        {rangeOrderInvalid ? (
                          <p className="mt-2 text-xs text-amber-800">
                            Start date must be on or before end date.
                          </p>
                        ) : null}
                        {rangeInFree === false && bookStart && bookEnd && !rangeOrderInvalid ? (
                          <p className="mt-2 text-xs text-amber-800">
                            No billable days in this range. Choose dates that include at
                            least one available day.
                          </p>
                        ) : null}
                        {preview ? (
                          <p className="mt-4 text-lg font-semibold text-foreground">
                            Total:{" "}
                            {formatMoney(
                              preview.lineTotal,
                              getListingCurrency(service),
                            )}
                            <span className="ml-2 text-sm font-normal text-foreground/60">
                              ({preview.billableUnits} × {formatPricingPeriodLabel(period)})
                            </span>
                          </p>
                        ) : null}
                        {preview &&
                        calendarSpanDays > 0 &&
                        billableDaysInRange > 0 &&
                        billableDaysInRange < calendarSpanDays ? (
                          <p className="mt-2 text-xs text-foreground/60">
                            {billableDaysInRange} billable{" "}
                            {billableDaysInRange === 1 ? "day" : "days"} in your selected
                            range (unavailable dates excluded).
                          </p>
                        ) : null}
                      </div>

                      {error ? (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                          {error}
                        </p>
                      ) : null}
                  </>

                  {sessionLoading ? (
                    <p className="text-sm text-foreground/60">Checking session…</p>
                  ) : user ? (
                    <button
                      type="button"
                      disabled={busy || !preview || rangeInFree === false || rangeOrderInvalid}
                      onClick={() => void handleCheckout()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004a7c] to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50 sm:w-auto"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Pay with Paystack
                    </button>
                  ) : (
                    <Link
                      href={loginHref}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-ambuhub-brand bg-white px-6 py-3 text-sm font-semibold text-ambuhub-brand sm:w-auto"
                    >
                      Log in to book
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
