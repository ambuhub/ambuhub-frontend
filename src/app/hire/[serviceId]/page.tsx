"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarRange,
  CreditCard,
  Hash,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import { getCountryNameByCode } from "@/lib/countries";
import {
  assertHireEndAllowedClient,
  formatHireReturnWindowSummary,
  formatHm12,
  formatReturnDeadlineClient,
  hasValidHireReturnWindow,
  parseHireEndForValidation,
  suggestNextValidHirePeriod,
} from "@/lib/hire-return-window";
import { previewHireLineTotalNgn } from "@/lib/hire-pricing-client";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import {
  fetchMarketplaceServiceById,
  postHireSimulateCheckout,
} from "@/lib/marketplace-hire";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

function descriptionSnippet(text: string, max = 200): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

function isHireBookable(svc: MarketplaceServiceRow): boolean {
  return (
    svc.listingType === "hire" &&
    typeof svc.price === "number" &&
    svc.price >= 0 &&
    svc.pricingPeriod != null &&
    isPricingPeriod(svc.pricingPeriod) &&
    typeof svc.stock === "number" &&
    svc.stock >= 1 &&
    svc.isAvailable !== false &&
    hasValidHireReturnWindow(svc.hireReturnWindow)
  );
}

function hireUnavailableReason(svc: MarketplaceServiceRow): string {
  if (svc.listingType !== "hire") {
    return "This listing is not a hire listing.";
  }
  if (!hasValidHireReturnWindow(svc.hireReturnWindow)) {
    return "This listing has no return schedule. Hire checkout is unavailable until the provider updates it.";
  }
  if (typeof svc.price !== "number" || svc.price < 0) {
    return "This listing does not have a valid hire price.";
  }
  if (!svc.pricingPeriod || !isPricingPeriod(svc.pricingPeriod)) {
    return "This listing is missing a billing period.";
  }
  if (typeof svc.stock !== "number" || svc.stock < 1) {
    return "This listing is out of stock.";
  }
  if (svc.isAvailable === false) {
    return "This listing is not currently available.";
  }
  return "This listing cannot be hired right now.";
}

export default function HireCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = typeof params?.serviceId === "string" ? params.serviceId : "";
  const { user, loading: sessionLoading } = useSessionAndCart();

  const [service, setService] = useState<MarketplaceServiceRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [hireStart, setHireStart] = useState("");
  const [hireEnd, setHireEnd] = useState("");
  const [datesInitialized, setDatesInitialized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDatesInitialized(false);
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId) {
      setLoadingService(false);
      setLoadError("Missing listing.");
      setService(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingService(true);
      setLoadError(null);
      try {
        const svc = await fetchMarketplaceServiceById(serviceId);
        if (!cancelled) {
          if (!svc) {
            setService(null);
            setLoadError("This listing was not found or is not available.");
          } else {
            setService(svc);
            setLoadError(null);
          }
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

  useEffect(() => {
    if (!service || !isHireBookable(service) || datesInitialized) {
      return;
    }
    const period = service.pricingPeriod;
    const window = service.hireReturnWindow;
    if (!period || !isPricingPeriod(period) || !window) {
      return;
    }
    const suggested = suggestNextValidHirePeriod(window, period);
    if (suggested) {
      setHireStart(suggested.hireStart);
      setHireEnd(suggested.hireEnd);
    }
    setDatesInitialized(true);
  }, [service, datesInitialized]);

  const maxQty = service && typeof service.stock === "number" ? service.stock : 1;
  const clampedQty = Math.min(Math.max(1, quantity), maxQty);

  const returnWindow = hasValidHireReturnWindow(service?.hireReturnWindow)
    ? service.hireReturnWindow
    : null;

  const preview = useMemo(() => {
    if (!service || !isHireBookable(service) || !service.pricingPeriod) {
      return null;
    }
    const period = service.pricingPeriod;
    if (!isPricingPeriod(period)) {
      return null;
    }
    const unit = service.price ?? 0;
    return previewHireLineTotalNgn(period, hireStart, hireEnd, unit, clampedQty);
  }, [service, hireStart, hireEnd, clampedQty]);

  const returnValidation = useMemo(() => {
    if (!service?.pricingPeriod || !returnWindow || !hireEnd.trim()) {
      return null;
    }
    const period = service.pricingPeriod;
    if (!isPricingPeriod(period)) {
      return null;
    }
    const end = parseHireEndForValidation(hireEnd, period);
    if (!end) {
      return "Choose a valid return date or time.";
    }
    return assertHireEndAllowedClient(end, returnWindow, period);
  }, [service, returnWindow, hireEnd]);

  const returnDeadline = useMemo(() => {
    if (returnValidation || !returnWindow || !service?.pricingPeriod || !hireEnd.trim()) {
      return null;
    }
    const period = service.pricingPeriod;
    if (!isPricingPeriod(period)) {
      return null;
    }
    const end = parseHireEndForValidation(hireEnd, period);
    if (!end) {
      return null;
    }
    return formatReturnDeadlineClient(end, returnWindow, period);
  }, [service, returnWindow, hireEnd, returnValidation]);

  const adjustQty = useCallback(
    (next: number) => {
      setError(null);
      if (next < 1) {
        return;
      }
      setQuantity(Math.min(next, maxQty));
    },
    [maxQty],
  );

  async function handleCheckout() {
    setError(null);
    if (!service || !isHireBookable(service) || !service.pricingPeriod) {
      setError("This listing cannot be booked.");
      return;
    }
    if (!preview) {
      setError("Choose valid hire dates and times.");
      return;
    }
    if (returnValidation) {
      setError(returnValidation);
      return;
    }
    const period = service.pricingPeriod;
    let startPayload = hireStart.trim();
    let endPayload = hireEnd.trim();
    if (period === "hourly") {
      const s = new Date(hireStart);
      const e = new Date(hireEnd);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        setError("Enter valid start and end date-times.");
        return;
      }
      startPayload = s.toISOString();
      endPayload = e.toISOString();
    }
    setBusy(true);
    try {
      const { order } = await postHireSimulateCheckout({
        serviceId: service.id,
        quantity: clampedQty,
        hireStart: startPayload,
        hireEnd: endPayload,
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

  const loginNext = serviceId ? `/hire/${encodeURIComponent(serviceId)}` : "/hire";
  const loginHref = `/auth?next=${encodeURIComponent(loginNext)}`;

  const hasLocation =
    service &&
    (service.countryCode || service.stateProvince || service.officeAddress);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50/80">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-gradient-to-r from-cyan-50 to-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0c4a6e] shadow-[0_0_22px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.9)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-600" aria-hidden />
              Hire booking
            </span>
            <span className="hidden text-xs font-medium text-foreground/50 sm:inline">
              West Africa Time · secure checkout flow
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <span className="bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-transparent">
              Hire checkout
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
            Paystack is not connected yet. Completing payment runs a temporary simulation
            only.
          </p>

          {loadingService || sessionLoading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" aria-label="Loading" />
            </div>
          ) : !service ? (
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-cyan-400/55 bg-white p-8 text-center shadow-[0_0_28px_-6px_rgba(34,211,238,0.35),0_0_1px_rgba(0,105,180,0.2)]">
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-400/25 blur-2xl"
                aria-hidden
              />
              <p className="relative text-foreground/80">{loadError ?? "Listing not found."}</p>
              <Link
                href="/#services"
                className="relative mt-4 inline-flex text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-cyan-700 hover:underline"
              >
                Browse services
              </Link>
            </div>
          ) : !isHireBookable(service) ? (
            <div className="mt-10 space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-50 via-white to-orange-50/80 px-4 py-4 text-sm text-amber-950 shadow-[0_0_32px_-8px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]">
                {hireUnavailableReason(service)}
              </div>
              {service.title ? (
                <div className="relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-white p-5 shadow-[0_0_28px_-4px_rgba(34,211,238,0.3)] ring-1 ring-sky-300/30 sm:p-6">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400" />
                  <p className="font-semibold text-foreground">{service.title}</p>
                  <p className="mt-1 text-xs text-foreground/60">
                    {service.category.name} · {service.departmentName}
                  </p>
                </div>
              ) : null}
              <Link
                href={`/services/${service.category.slug}`}
                className="inline-flex text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-cyan-700 hover:underline"
              >
                Back to category
              </Link>
            </div>
          ) : !user ? (
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-[#061a33] via-[#0a2544] to-[#0c3054] p-8 text-center shadow-[0_0_40px_-6px_rgba(34,211,238,0.45),0_0_80px_-20px_rgba(0,105,180,0.35)]">
              <div
                className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-sky-400/25 blur-2xl"
                aria-hidden
              />
              <CalendarRange
                className="relative mx-auto h-10 w-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="relative mt-4 text-slate-100">
                Log in to complete your hire booking.
              </p>
              <Link
                href={loginHref}
                className="relative mt-5 inline-flex rounded-xl border border-cyan-400/40 bg-gradient-to-r from-[#0069b4] to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(34,211,238,0.55)] transition hover:from-[#0078c9] hover:to-cyan-400"
              >
                Log in
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {error ? (
                <p
                  className="rounded-xl border border-red-400/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900 shadow-[0_0_20px_-4px_rgba(239,68,68,0.35)]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/50 to-cyan-100/40 p-5 shadow-[0_0_32px_-6px_rgba(34,211,238,0.35),0_0_1px_rgba(0,105,180,0.15)] ring-1 ring-cyan-200/40 sm:p-6">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(6, 182, 212, 0.06) 12px, rgba(6, 182, 212, 0.06) 13px)",
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-sky-400/20 blur-2xl"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-emerald-400 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
                <div className="relative flex items-start gap-3 sm:items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg shadow-cyan-500/35 ring-2 ring-white/60">
                    <Package className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#0c4a6e]">
                      Service details
                    </h2>
                    <p className="mt-0.5 text-xs text-[#0369a1]/80">
                      Review the listing before you book
                    </p>
                  </div>
                </div>
                <div className="relative mt-5 flex flex-col gap-4 sm:flex-row sm:gap-6">
                  {service.photoUrls[0] ? (
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-cyan-400/55 shadow-[0_0_24px_-4px_rgba(34,211,238,0.5)] sm:h-32 sm:w-36">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.photoUrls[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{service.title}</p>
                    <p className="mt-1 text-xs text-foreground/60">
                      {service.category.name} · {service.departmentName}
                    </p>
                    {service.description.trim() ? (
                      <p className="mt-2 text-sm text-foreground/75">
                        {descriptionSnippet(service.description)}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-cyan-500/25">
                        {typeof service.price === "number" ? formatNaira(service.price) : "—"}
                        <span className="font-medium opacity-90">
                          {formatHirePricePeriodSuffix(service.pricingPeriod)}
                        </span>
                      </span>
                      <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-400/35">
                        {formatPricingPeriodLabel(service.pricingPeriod)} billing
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground/55">
                      Stock available:{" "}
                      <span className="font-semibold text-[#0c4a6e]">{service.stock ?? "—"}</span>
                    </p>
                  </div>
                </div>

                {hasLocation ? (
                  <div className="relative mt-5 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 p-4 pt-5 ring-1 ring-indigo-100 shadow-inner">
                    <div className="pointer-events-none absolute left-4 top-0 h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-900">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-700">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      Office location
                    </h3>
                    <dl className="mt-3 space-y-2 text-sm text-foreground/85">
                      {service.countryCode ? (
                        <div>
                          <dt className="text-xs font-medium text-foreground/55">Country</dt>
                          <dd>
                            {getCountryNameByCode(service.countryCode) ?? service.countryCode}
                          </dd>
                        </div>
                      ) : null}
                      {service.stateProvince || service.stateProvinceName ? (
                        <div>
                          <dt className="text-xs font-medium text-foreground/55">
                            State / province
                          </dt>
                          <dd>
                            {service.stateProvinceName ?? service.stateProvince}
                          </dd>
                        </div>
                      ) : null}
                      {service.officeAddress ? (
                        <div>
                          <dt className="text-xs font-medium text-foreground/55">Address</dt>
                          <dd className="whitespace-pre-wrap">{service.officeAddress}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}

                {returnWindow ? (
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/30 p-4 ring-1 ring-amber-100/80">
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-16 w-16 translate-x-1/3 -translate-y-1/3 rounded-full bg-amber-300/25 blur-xl"
                      aria-hidden
                    />
                    <h3 className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-950">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/25 text-amber-900">
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      Return schedule (WAT)
                    </h3>
                    <p className="relative mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-100/80 to-orange-100/60 px-3 py-2 text-sm font-semibold text-amber-950 shadow-[0_0_18px_-2px_rgba(251,191,36,0.35),inset_0_1px_0_rgba(255,255,255,0.85)]">
                      {formatHireReturnWindowSummary(returnWindow)}
                    </p>
                    <p className="mt-2 text-xs text-foreground/55">
                      Your return date and time must fall within this window (West Africa Time).
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-violet-300/45 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/40 p-5 shadow-[0_0_28px_-6px_rgba(139,92,246,0.22)] ring-1 ring-violet-200/50 sm:p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.45)]" />
                <div className="pointer-events-none absolute -left-12 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-violet-400/15 blur-2xl" aria-hidden />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                    <Hash className="h-5 w-5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-violet-950">Quantity</h2>
                    <p className="text-xs text-violet-800/70">How many units to hire</p>
                  </div>
                </div>
                <div className="relative mt-4 inline-flex items-center overflow-hidden rounded-xl border border-violet-300/55 bg-gradient-to-b from-white to-violet-50/60 shadow-[0_0_20px_-4px_rgba(139,92,246,0.2)] shadow-inner ring-1 ring-violet-200/50">
                  <button
                    type="button"
                    disabled={busy || clampedQty <= 1}
                    onClick={() => adjustQty(clampedQty - 1)}
                    className="p-2 text-violet-900 transition hover:bg-violet-100/90 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2rem] bg-gradient-to-b from-violet-50/80 to-white text-center text-sm font-bold text-violet-900">
                    {clampedQty}
                  </span>
                  <button
                    type="button"
                    disabled={busy || clampedQty >= maxQty}
                    onClick={() => adjustQty(clampedQty + 1)}
                    className="p-2 text-violet-900 transition hover:bg-violet-100/90 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/45 p-5 shadow-[0_0_28px_-6px_rgba(20,184,166,0.25)] ring-1 ring-teal-200/45 sm:p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 shadow-[0_0_12px_rgba(20,184,166,0.4)]" />
                <div
                  className="pointer-events-none absolute -right-12 top-6 h-36 w-36 rounded-full bg-teal-400/12 blur-3xl"
                  aria-hidden
                />
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" aria-hidden />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
                    <CalendarClock className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-teal-950">Hire period</h2>
                    <p className="text-xs text-teal-900/65">Start and return within the window</p>
                  </div>
                </div>
                {service.pricingPeriod === "hourly" ? (
                  <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-foreground/70">
                      Start
                      <input
                        type="datetime-local"
                        value={hireStart}
                        onChange={(e) => {
                          setError(null);
                          setHireStart(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-teal-300/60 bg-white/95 px-3 py-2 text-sm text-foreground shadow-[0_0_16px_-4px_rgba(20,184,166,0.18)] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/35"
                      />
                    </label>
                    <label className="block text-xs font-medium text-foreground/70">
                      Return by
                      <input
                        type="datetime-local"
                        value={hireEnd}
                        onChange={(e) => {
                          setError(null);
                          setHireEnd(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-teal-300/60 bg-white/95 px-3 py-2 text-sm text-foreground shadow-[0_0_16px_-4px_rgba(20,184,166,0.18)] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/35"
                      />
                      <span className="mt-1 block text-[11px] text-foreground/55">
                        Return time must be within the provider&apos;s schedule, interpreted in
                        West Africa Time (WAT).
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-foreground/70">
                      Start date
                      <input
                        type="date"
                        value={hireStart}
                        onChange={(e) => {
                          setError(null);
                          setHireStart(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-teal-300/60 bg-white/95 px-3 py-2 text-sm text-foreground shadow-[0_0_16px_-4px_rgba(20,184,166,0.18)] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/35"
                      />
                    </label>
                    <label className="block text-xs font-medium text-foreground/70">
                      Return by (date)
                      <input
                        type="date"
                        value={hireEnd}
                        onChange={(e) => {
                          setError(null);
                          setHireEnd(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-teal-300/60 bg-white/95 px-3 py-2 text-sm text-foreground shadow-[0_0_16px_-4px_rgba(20,184,166,0.18)] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400/35"
                      />
                      {returnWindow ? (
                        <span className="mt-1 block text-[11px] text-foreground/55">
                          Item must be returned by{" "}
                          {formatHm12(returnWindow.timeEnd)} WAT on the selected day.
                        </span>
                      ) : null}
                    </label>
                  </div>
                )}
                {!hireEnd.trim() && returnWindow ? (
                  <p className="mt-3 text-xs text-foreground/55">
                    Choose when you will return the item (must match the return schedule above).
                  </p>
                ) : null}
                {returnDeadline ? (
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Return deadline:{" "}
                    <span className="bg-gradient-to-r from-[#0069b4] to-cyan-600 bg-clip-text font-semibold text-transparent">
                      {returnDeadline}
                    </span>
                  </p>
                ) : null}
                {returnValidation ? (
                  <p className="mt-4 text-xs text-red-700" role="alert">
                    {returnValidation}
                  </p>
                ) : preview ? (
                  <p className="mt-4 inline-flex flex-wrap gap-2 text-xs text-foreground/70">
                    <span className="rounded-lg bg-teal-500/15 px-2 py-1 font-medium text-teal-900 ring-1 ring-teal-300/40">
                      Billing units ({formatPricingPeriodLabel(service.pricingPeriod)}):{" "}
                      <span className="font-bold text-teal-950">{preview.billableUnits}</span>
                    </span>
                  </p>
                ) : hireStart && hireEnd ? (
                  <p className="mt-4 text-xs text-red-700">
                    Adjust the period so the end is after the start.
                  </p>
                ) : null}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-400/60 bg-gradient-to-br from-[#031d3d] via-[#053558] to-[#0a5c7a] p-6 shadow-[0_0_40px_-4px_rgba(34,211,238,0.5),0_0_80px_-20px_rgba(0,105,180,0.35)] ring-1 ring-cyan-400/30 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 120%, rgba(34,211,238,0.35), transparent 45%), radial-gradient(circle at 90% -20%, rgba(168,85,247,0.2), transparent 40%)",
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-400/25 blur-2xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:[&>div]:flex-1">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-100 shadow-inner">
                      <CreditCard className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-sky-200/90">Total (NGN)</p>
                      <p className="mt-1 bg-gradient-to-r from-white via-cyan-100 to-sky-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                        {preview ? formatNaira(preview.lineTotalNgn) : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy || !preview || !!returnValidation}
                    onClick={() => void handleCheckout()}
                    className="relative inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-white px-6 py-3.5 text-sm font-bold text-[#004a7c] shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)] transition hover:border-cyan-300 hover:bg-sky-50 hover:shadow-[0_0_32px_-2px_rgba(34,211,238,0.55)] disabled:opacity-60 sm:w-auto"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#004a7c]" aria-hidden />
                    ) : null}
                    Pay with Paystack (simulated)
                  </button>
                </div>
              </div>

              <Link
                href={`/services/${service.category.slug}`}
                className="inline-flex text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-cyan-700 hover:underline"
              >
                ← Back to category
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
