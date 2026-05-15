"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchProviderHireBookings,
  type ProviderHireBookingRow,
} from "@/lib/provider-bookings";
import { formatPricingPeriodLabel } from "@/lib/pricing-period";

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

function isHireActive(hireEndIso: string): boolean {
  try {
    return new Date(hireEndIso).getTime() >= Date.now();
  } catch {
    return false;
  }
}

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<ProviderHireBookingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchProviderHireBookings();
        if (!cancelled) {
          setBookings(rows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load bookings.");
          setBookings(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Hire orders for your listings: what was booked, when the hire period ends, and customer
          contact details.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Loading" />
        </div>
      ) : error ? (
        <div
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : !bookings?.length ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
          No hire bookings yet. When clients complete a hire checkout on your listings, they will
          appear here.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="mt-8 space-y-4 md:hidden">
            {bookings.map((row) => {
              const active = isHireActive(row.hireEnd);
              return (
                <li
                  key={`${row.orderId}-${row.serviceId}-${row.hireStart}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{row.listingTitle}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {active ? "Active" : "Ended"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {row.customer.firstName} {row.customer.lastName}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    <span className="text-slate-500">Email:</span> {row.customer.email || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    <span className="text-slate-500">Phone:</span> {row.customer.phone || "—"}
                  </p>
                  <div className="mt-3 grid gap-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <p>
                      <span className="text-slate-500">Starts:</span>{" "}
                      {formatDateTime(row.hireStart)}
                    </p>
                    <p>
                      <span className="text-slate-500">Ends:</span>{" "}
                      {formatDateTime(row.hireEnd)}
                    </p>
                    <p>
                      <span className="text-slate-500">Period:</span>{" "}
                      {formatPricingPeriodLabel(
                        row.pricingPeriod as "hourly" | "daily" | "weekly" | "monthly" | "yearly",
                      )}
                      {" · "}
                      {row.hireBillableUnits} unit{row.hireBillableUnits === 1 ? "" : "s"} · Qty{" "}
                      {row.quantity}
                    </p>
                    <p className="font-semibold text-slate-900">{formatNgn(row.lineTotalNgn)}</p>
                    <p className="text-slate-500">
                      Receipt {row.receiptNumber} · Order {row.orderId.slice(-8)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">Ends (expiry)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Period / units</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bookings.map((row) => {
                  const active = isHireActive(row.hireEnd);
                  return (
                    <tr key={`${row.orderId}-${row.serviceId}-${row.hireStart}`} className="bg-white">
                      <td className="max-w-[10rem] px-4 py-3 font-medium text-slate-900">
                        {row.listingTitle}
                      </td>
                      <td className="min-w-[12rem] px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {row.customer.firstName} {row.customer.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{row.customer.email}</div>
                        <div className="text-xs text-slate-500">{row.customer.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDateTime(row.hireStart)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDateTime(row.hireEnd)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {active ? "Active" : "Ended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatPricingPeriodLabel(
                          row.pricingPeriod as
                            | "hourly"
                            | "daily"
                            | "weekly"
                            | "monthly"
                            | "yearly",
                        )}
                        <span className="text-slate-400"> · </span>
                        {row.hireBillableUnits}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                        {formatNgn(row.lineTotalNgn)}
                      </td>
                      <td className="max-w-[8rem] px-4 py-3 text-xs text-slate-500">
                        <div className="truncate" title={row.receiptNumber}>
                          {row.receiptNumber}
                        </div>
                        <div className="truncate font-mono text-[10px] text-slate-400">
                          {row.orderId}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
