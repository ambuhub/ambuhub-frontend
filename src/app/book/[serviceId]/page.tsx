"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { bookUnavailableReason, isBookBookable } from "@/lib/book-bookable";
import { formatBookingWindowSummary } from "@/lib/booking-window";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import { previewHireLineTotalNgn } from "@/lib/hire-pricing-client";
import { fetchMarketplaceServiceById } from "@/lib/marketplace-hire";
import {
  fetchBookingAvailability,
  postBookSimulateCheckout,
  type BookingAvailabilityResponse,
} from "@/lib/marketplace-book";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

function formatRangeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function BookCheckoutPage() {
  const params = useParams();
  const router = useRouter();
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const period =
    service?.pricingPeriod && isPricingPeriod(service.pricingPeriod)
      ? service.pricingPeriod
      : null;

  const preview = useMemo(() => {
    if (!service || !period || !isBookBookable(service)) {
      return null;
    }
    const unit = service.price ?? 0;
    return previewHireLineTotalNgn(period, bookStart, bookEnd, unit, 1);
  }, [service, period, bookStart, bookEnd]);

  const rangeInFree = useMemo(() => {
    if (!availability?.freeRanges.length || !bookStart.trim() || !bookEnd.trim()) {
      return null;
    }
    try {
      const start = new Date(bookStart).getTime();
      const end = new Date(bookEnd).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        return false;
      }
      return availability.freeRanges.some((r) => {
        const fs = new Date(r.start).getTime();
        const fe = new Date(r.end).getTime();
        return start >= fs && end <= fe;
      });
    } catch {
      return false;
    }
  }, [availability, bookStart, bookEnd]);

  const pickFromFree = useCallback((isoStart: string) => {
    setBookStart(isoStart.slice(0, 16));
    const end = new Date(isoStart);
    end.setHours(end.getHours() + 1);
    setBookEnd(end.toISOString().slice(0, 16));
    setError(null);
  }, []);

  async function handleCheckout() {
    setError(null);
    if (!service || !isBookBookable(service) || !period) {
      setError("This listing cannot be booked.");
      return;
    }
    if (!preview) {
      setError("Choose valid booking start and end times.");
      return;
    }
    if (rangeInFree === false) {
      setError("Selected time must fall within an available slot.");
      return;
    }
    let startPayload = bookStart.trim();
    let endPayload = bookEnd.trim();
    if (period === "hourly") {
      const s = new Date(bookStart);
      const e = new Date(bookEnd);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        setError("Enter valid start and end date-times.");
        return;
      }
      startPayload = s.toISOString();
      endPayload = e.toISOString();
    }
    setBusy(true);
    try {
      const { order } = await postBookSimulateCheckout({
        serviceId: service.id,
        bookStart: startPayload,
        bookEnd: endPayload,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT));
      }
      router.push(`/receipts/${order.id}`);
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
                {period ? formatPricingPeriodLabel(period) : "—"}
                {typeof service.price === "number"
                  ? ` · ${formatNaira(service.price)} ${formatHirePricePeriodSuffix(period)}`
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
                        {availability && availability.bookingGapMinutes > 0
                          ? ` · ${availability.bookingGapMinutes} min gap between bookings`
                          : null}
                      </span>
                    </p>
                  ) : null}

                  {availability && availability.freeRanges.length > 0 ? (
                    <div className="rounded-2xl border border-cyan-200/60 bg-white p-4 shadow-sm">
                      <h2 className="text-sm font-semibold text-foreground">
                        Available times (next 30 days)
                      </h2>
                      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
                        {availability.freeRanges.slice(0, 24).map((r) => (
                          <li key={`${r.start}-${r.end}`}>
                            <button
                              type="button"
                              onClick={() => pickFromFree(r.start)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-cyan-400 hover:bg-cyan-50/50"
                            >
                              {formatRangeLabel(r.start)} – {formatRangeLabel(r.end)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/60">
                      No open slots in the next 30 days. Try another listing or check back
                      later.
                    </p>
                  )}

                  <div className="rounded-2xl border border-cyan-200/60 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-foreground">Your booking</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Start
                        </label>
                        <input
                          type={period === "hourly" ? "datetime-local" : "date"}
                          value={bookStart}
                          onChange={(e) => setBookStart(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          End
                        </label>
                        <input
                          type={period === "hourly" ? "datetime-local" : "date"}
                          value={bookEnd}
                          onChange={(e) => setBookEnd(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    {rangeInFree === false && bookStart && bookEnd ? (
                      <p className="mt-2 text-xs text-amber-800">
                        Selected range is outside available hours or overlaps another
                        booking.
                      </p>
                    ) : null}
                    {preview ? (
                      <p className="mt-4 text-lg font-semibold text-foreground">
                        Total: {formatNaira(preview.lineTotalNgn)}
                        <span className="ml-2 text-sm font-normal text-foreground/60">
                          ({preview.billableUnits} × {formatPricingPeriodLabel(period)})
                        </span>
                      </p>
                    ) : null}
                  </div>

                  {error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                      {error}
                    </p>
                  ) : null}

                  {sessionLoading ? (
                    <p className="text-sm text-foreground/60">Checking session…</p>
                  ) : user ? (
                    <button
                      type="button"
                      disabled={busy || !preview}
                      onClick={() => void handleCheckout()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004a7c] to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50 sm:w-auto"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Simulate payment
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
