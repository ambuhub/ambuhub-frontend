"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import { previewHireLineTotalNgn } from "@/lib/hire-pricing-client";
import {
  fetchMarketplaceServiceById,
  postHireSimulateCheckout,
} from "@/lib/marketplace-hire";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function addHours(d: Date, hours: number): Date {
  const out = new Date(d);
  out.setHours(out.getHours() + hours);
  return out;
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
    svc.isAvailable !== false
  );
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
    if (!period || !isPricingPeriod(period)) {
      return;
    }
    const now = new Date();
    if (period === "hourly") {
      const start = now;
      const end = addHours(now, 2);
      setHireStart(toDatetimeLocalValue(start));
      setHireEnd(toDatetimeLocalValue(end));
    } else {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = addDays(start, 1);
      setHireStart(toDateInputValue(start));
      setHireEnd(toDateInputValue(end));
    }
    setDatesInitialized(true);
  }, [service, datesInitialized]);

  const maxQty = service && typeof service.stock === "number" ? service.stock : 1;
  const clampedQty = Math.min(Math.max(1, quantity), maxQty);

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hire checkout
          </h1>
          <p className="mt-2 text-sm text-foreground/70 sm:text-base">
            Paystack is not connected yet. Completing payment runs a temporary simulation
            only.
          </p>

          {loadingService || sessionLoading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ambuhub-brand" aria-label="Loading" />
            </div>
          ) : !service ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/40 p-8 text-center">
              <p className="text-foreground/80">{loadError ?? "Listing not found."}</p>
              <Link
                href="/#services"
                className="mt-4 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline"
              >
                Browse services
              </Link>
            </div>
          ) : !isHireBookable(service) ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/40 p-8 text-center">
              <p className="text-foreground/80">
                This listing is not available for hire, or is missing price, billing period, or
                stock.
              </p>
              <Link
                href={`/services/${service.category.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline"
              >
                Back to category
              </Link>
            </div>
          ) : !user ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/40 p-8 text-center">
              <p className="text-foreground/80">Log in to complete your hire booking.</p>
              <Link
                href={loginHref}
                className="mt-4 inline-flex rounded-xl bg-ambuhub-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Log in
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {error ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="rounded-2xl border border-ambuhub-100 bg-white p-5 sm:p-6">
                <p className="font-semibold text-foreground">{service.title}</p>
                <p className="mt-1 text-xs text-foreground/60">
                  {service.category.name} · {service.departmentName}
                </p>
                <p className="mt-3 text-sm text-foreground/80">
                  {typeof service.price === "number" ? formatNaira(service.price) : "—"}{" "}
                  {formatHirePricePeriodSuffix(service.pricingPeriod)} ·{" "}
                  {formatPricingPeriodLabel(service.pricingPeriod)} billing
                </p>
                <p className="mt-1 text-xs text-foreground/55">
                  Stock available: {service.stock ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-ambuhub-100 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-foreground">Quantity</h2>
                <div className="mt-3 inline-flex items-center rounded-xl border border-ambuhub-200 bg-white">
                  <button
                    type="button"
                    disabled={busy || clampedQty <= 1}
                    onClick={() => adjustQty(clampedQty - 1)}
                    className="p-2 text-foreground hover:bg-ambuhub-50 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold">
                    {clampedQty}
                  </span>
                  <button
                    type="button"
                    disabled={busy || clampedQty >= maxQty}
                    onClick={() => adjustQty(clampedQty + 1)}
                    className="p-2 text-foreground hover:bg-ambuhub-50 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-ambuhub-100 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-foreground">Hire period</h2>
                {service.pricingPeriod === "hourly" ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-foreground/70">
                      Start
                      <input
                        type="datetime-local"
                        value={hireStart}
                        onChange={(e) => {
                          setError(null);
                          setHireStart(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-ambuhub-200 px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                    <label className="block text-xs font-medium text-foreground/70">
                      End
                      <input
                        type="datetime-local"
                        value={hireEnd}
                        onChange={(e) => {
                          setError(null);
                          setHireEnd(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-ambuhub-200 px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-medium text-foreground/70">
                      Start date
                      <input
                        type="date"
                        value={hireStart}
                        onChange={(e) => {
                          setError(null);
                          setHireStart(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-ambuhub-200 px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                    <label className="block text-xs font-medium text-foreground/70">
                      End date
                      <input
                        type="date"
                        value={hireEnd}
                        onChange={(e) => {
                          setError(null);
                          setHireEnd(e.target.value);
                        }}
                        className="mt-1 w-full rounded-xl border border-ambuhub-200 px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                  </div>
                )}
                {preview ? (
                  <p className="mt-4 text-xs text-foreground/60">
                    Billing units ({formatPricingPeriodLabel(service.pricingPeriod)}):{" "}
                    <span className="font-semibold text-foreground">{preview.billableUnits}</span>
                  </p>
                ) : hireStart && hireEnd ? (
                  <p className="mt-4 text-xs text-red-700">
                    Adjust the period so the end is after the start.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-ambuhub-200 bg-ambuhub-surface/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Total (NGN)</p>
                  <p className="text-xl font-bold text-foreground">
                    {preview ? formatNaira(preview.lineTotalNgn) : "—"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy || !preview}
                  onClick={() => void handleCheckout()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark disabled:opacity-60 sm:w-auto"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Pay with Paystack (simulated)
                </button>
              </div>

              <Link
                href={`/services/${service.category.slug}`}
                className="inline-flex text-sm font-semibold text-ambuhub-brand hover:underline"
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
