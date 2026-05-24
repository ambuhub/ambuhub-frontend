"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FALLBACK_THUMB } from "@/lib/landing-service-categories";
import {
  CalendarRange,
  ChevronRight,
  Clock,
  Mail,
  Package,
  Phone,
  Receipt,
  User,
  X,
} from "lucide-react";
import { formatPricingPeriodLabel, isPricingPeriod } from "@/lib/pricing-period";
import type { ProviderHireBookingCustomer } from "@/lib/provider-bookings";

export type ProviderBookingDisplayRow = {
  key: string;
  kind: "hire" | "personnel";
  orderId: string;
  receiptNumber: string;
  paidAt: string;
  serviceId: string;
  listingTitle: string;
  start: string;
  end: string;
  pricingPeriod: string;
  billableUnits: number;
  quantity: number;
  lineTotalNgn: number;
  customer: ProviderHireBookingCustomer;
  primaryPhotoUrl?: string;
};

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function isBookingActive(endIso: string): boolean {
  try {
    return new Date(endIso).getTime() >= Date.now();
  } catch {
    return false;
  }
}

/**
 * Fixed viewport height so flex children can shrink and the body scrolls.
 * (max-height alone does not constrain flex-1 scroll areas.)
 */
const PANEL_HEIGHT_CLASS =
  "flex h-[calc(100dvh-7.5rem)] max-h-[calc(100dvh-7.5rem)] min-h-0 flex-col overflow-hidden";

type Props = {
  row: ProviderBookingDisplayRow | null;
  onClose?: () => void;
  showClose?: boolean;
};

function BookingListingThumbnail({
  serviceId,
  photoUrl,
  alt,
}: {
  serviceId: string;
  photoUrl?: string;
  alt: string;
}) {
  const src = photoUrl?.trim() || FALLBACK_THUMB;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${serviceId}-${src}`}
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`text-sm text-slate-900 ${mono ? "font-mono text-xs break-all sm:text-right" : "sm:text-right"}`}
      >
        {value}
      </dd>
    </div>
  );
}

export function ProviderBookingDetailPanel({
  row,
  onClose,
  showClose = false,
}: Props) {
  if (!row) {
    return (
      <div
        className={`${PANEL_HEIGHT_CLASS} items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-8 text-center`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 shadow-inner">
          <CalendarRange className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-800">
          Select a booking
        </p>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Click a row in the list to view customer contact, schedule, and payment
          details here.
        </p>
      </div>
    );
  }

  const active = isBookingActive(row.end);
  const periodLabel = isPricingPeriod(row.pricingPeriod)
    ? formatPricingPeriodLabel(row.pricingPeriod)
    : row.pricingPeriod;

  return (
    <article
      key={row.key}
      className={`relative rounded-2xl border border-blue-200/60 bg-white shadow-xl shadow-blue-900/10 ring-1 ring-blue-100/80 ${PANEL_HEIGHT_CLASS}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-cyan-500 to-sky-400"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/15 blur-2xl"
        aria-hidden
      />

      <header className="relative shrink-0 border-b border-slate-100 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-5 py-5 text-white">
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-slate-800 shadow-lg ring-2 ring-white/10">
            <BookingListingThumbnail
              serviceId={row.serviceId}
              photoUrl={row.primaryPhotoUrl}
              alt={row.listingTitle}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90">
              {row.kind === "hire" ? "Hire booking" : "Personnel booking"}
            </p>
            <h2 className="mt-1 line-clamp-2 text-lg font-bold leading-snug">
              {row.listingTitle}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                active
                  ? "bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/40"
                  : "bg-white/10 text-slate-300 ring-1 ring-white/20"
              }`}
            >
              {active ? "Active" : "Ended"}
            </span>
            {showClose && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-slate-400">
          Receipt {row.receiptNumber}
        </p>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
        <div className="space-y-6 p-5 pb-6">
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User className="h-4 w-4 text-blue-600" aria-hidden />
            Customer
          </h3>
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="font-semibold text-slate-900">
              {row.customer.firstName} {row.customer.lastName}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                {row.customer.email || "—"}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                {row.customer.phone || "—"}
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-blue-600" aria-hidden />
            Schedule
          </h3>
          <dl className="mt-3 space-y-3 rounded-xl border border-cyan-100/80 bg-gradient-to-br from-cyan-50/50 to-white p-4">
            <DetailRow label="Starts" value={formatDateTime(row.start)} />
            <DetailRow label="Ends" value={formatDateTime(row.end)} />
            <DetailRow
              label="Billing"
              value={`${periodLabel} · ${row.billableUnits} unit${row.billableUnits === 1 ? "" : "s"}`}
            />
            <DetailRow label="Quantity" value={row.quantity} />
          </dl>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Receipt className="h-4 w-4 text-blue-600" aria-hidden />
            Payment
          </h3>
          <dl className="mt-3 space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <DetailRow label="Line total" value={formatNgn(row.lineTotalNgn)} />
            <DetailRow label="Paid at" value={formatDateTime(row.paidAt)} />
            <DetailRow label="Order ID" value={row.orderId} mono />
          </dl>
        </section>

        <Link
          href={`/provider/listings/${encodeURIComponent(row.serviceId)}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50/80 px-4 py-3 text-sm font-semibold text-blue-800 shadow-sm transition hover:border-blue-300 hover:from-blue-100 hover:to-cyan-100"
        >
          <Package className="h-4 w-4" aria-hidden />
          View listing
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
        </div>
      </div>
    </article>
  );
}

export function bookingRowKey(row: {
  orderId: string;
  serviceId: string;
  start: string;
}): string {
  return `${row.orderId}-${row.serviceId}-${row.start}`;
}

export { formatNgn, formatDateTime, isBookingActive };
