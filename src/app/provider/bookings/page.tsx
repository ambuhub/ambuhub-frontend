"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProviderBookingDetailPanel,
  bookingRowKey,
  formatDateTime,
  isBookingActive,
  type ProviderBookingDisplayRow,
} from "@/components/provider/ProviderBookingDetailPanel";
import {
  formatMoney,
  parseSupportedCurrency,
} from "@/lib/currency";
import {
  fetchProviderHireBookings,
  fetchProviderPersonnelBookings,
  fetchProviderSales,
  type ProviderHireBookingRow,
  type ProviderPersonnelBookingRow,
  type ProviderSaleRow,
} from "@/lib/provider-bookings";

type Tab = "hire" | "personnel" | "sales";

function toHireDisplayRows(rows: ProviderHireBookingRow[]): ProviderBookingDisplayRow[] {
  return rows.map((r) => ({
    key: bookingRowKey({ orderId: r.orderId, serviceId: r.serviceId, start: r.hireStart }),
    kind: "hire",
    orderId: r.orderId,
    receiptNumber: r.receiptNumber,
    paidAt: r.paidAt,
    currency: parseSupportedCurrency(r.currency),
    serviceId: r.serviceId,
    listingTitle: r.listingTitle,
    start: r.hireStart,
    end: r.hireEnd,
    pricingPeriod: r.pricingPeriod,
    billableUnits: r.hireBillableUnits,
    quantity: r.quantity,
    lineTotal: r.lineTotal,
    customer: r.customer,
    primaryPhotoUrl: r.primaryPhotoUrl,
  }));
}

function toPersonnelDisplayRows(
  rows: ProviderPersonnelBookingRow[],
): ProviderBookingDisplayRow[] {
  return rows.map((r) => ({
    key: bookingRowKey({ orderId: r.orderId, serviceId: r.serviceId, start: r.bookStart }),
    kind: "personnel",
    orderId: r.orderId,
    receiptNumber: r.receiptNumber,
    paidAt: r.paidAt,
    currency: parseSupportedCurrency(r.currency),
    serviceId: r.serviceId,
    listingTitle: r.listingTitle,
    start: r.bookStart,
    end: r.bookEnd,
    pricingPeriod: r.pricingPeriod,
    billableUnits: r.bookBillableUnits,
    quantity: r.quantity,
    lineTotal: r.lineTotal,
    customer: r.customer,
    primaryPhotoUrl: r.primaryPhotoUrl,
  }));
}

function toSaleDisplayRows(rows: ProviderSaleRow[]): ProviderBookingDisplayRow[] {
  return rows.map((r) => ({
    key: bookingRowKey({ orderId: r.orderId, serviceId: r.serviceId, start: r.paidAt }),
    kind: "sale",
    orderId: r.orderId,
    receiptNumber: r.receiptNumber,
    paidAt: r.paidAt,
    currency: parseSupportedCurrency(r.currency),
    serviceId: r.serviceId,
    listingTitle: r.listingTitle,
    start: r.paidAt,
    end: r.paidAt,
    quantity: r.quantity,
    unitPrice: r.unitPrice,
    lineTotal: r.lineTotal,
    customer: r.customer,
    primaryPhotoUrl: r.primaryPhotoUrl,
  }));
}

export default function ProviderBookingsPage() {
  const [tab, setTab] = useState<Tab>("hire");
  const [hireBookings, setHireBookings] = useState<ProviderHireBookingRow[] | null>(
    null,
  );
  const [personnelBookings, setPersonnelBookings] = useState<
    ProviderPersonnelBookingRow[] | null
  >(null);
  const [sales, setSales] = useState<ProviderSaleRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [hire, personnel, saleRows] = await Promise.all([
          fetchProviderHireBookings(),
          fetchProviderPersonnelBookings(),
          fetchProviderSales(),
        ]);
        if (!cancelled) {
          setHireBookings(hire);
          setPersonnelBookings(personnel);
          setSales(saleRows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load bookings.");
          setHireBookings(null);
          setPersonnelBookings(null);
          setSales(null);
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

  const displayRows = useMemo((): ProviderBookingDisplayRow[] => {
    if (tab === "hire" && hireBookings) {
      return toHireDisplayRows(hireBookings);
    }
    if (tab === "personnel" && personnelBookings) {
      return toPersonnelDisplayRows(personnelBookings);
    }
    if (tab === "sales" && sales) {
      return toSaleDisplayRows(sales);
    }
    return [];
  }, [tab, hireBookings, personnelBookings, sales]);

  useEffect(() => {
    if (displayRows.length === 0) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((prev) => {
      if (prev && displayRows.some((r) => r.key === prev)) {
        return prev;
      }
      return displayRows[0]?.key ?? null;
    });
  }, [displayRows, tab]);

  const selectedRow = useMemo(
    () => displayRows.find((r) => r.key === selectedKey) ?? null,
    [displayRows, selectedKey],
  );

  const handleSelect = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="rounded-[26px] border border-blue-100/80 bg-white/95 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Bookings
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sales, hire, and personnel bookings for your listings. Select a row to
              view full details.
            </p>
          </div>
          <div className="flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setTab("sales")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "sales"
                  ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              Sales
            </button>
            <button
              type="button"
              onClick={() => setTab("hire")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "hire"
                  ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              Hire
            </button>
            <button
              type="button"
              onClick={() => setTab("personnel")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "personnel"
                  ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              Booking
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-14 flex justify-center py-12">
            <Loader2
              className="h-9 w-9 animate-spin text-blue-600"
              aria-label="Loading"
            />
          </div>
        ) : error ? (
          <div
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : displayRows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-16 text-center">
            <p className="text-slate-600">
              {tab === "sales"
                ? "No sales yet. When clients purchase your listings, they will appear here."
                : tab === "hire"
                  ? "No hire bookings yet. When clients complete hire checkout, they will appear here."
                  : "No personnel bookings yet. When clients book your listings, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start">
            <div className="min-w-0 space-y-4">
              {/* Mobile detail (above list when a row is selected) */}
              {selectedRow ? (
                <div className="lg:hidden">
                  <ProviderBookingDetailPanel
                    key={selectedKey ?? "none"}
                    row={selectedRow}
                    showClose
                    onClose={() => setSelectedKey(null)}
                  />
                </div>
              ) : null}

              {/* Mobile cards */}
              <ul className="space-y-2 md:hidden">
                {displayRows.map((row) => {
                  const active = row.kind !== "sale" && isBookingActive(row.end);
                  const selected = row.key === selectedKey;
                  return (
                    <li key={row.key}>
                      <button
                        type="button"
                        onClick={() => handleSelect(row.key)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50/80 shadow-md ring-2 ring-blue-400/30"
                            : "border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {row.listingTitle}
                          </p>
                          {row.kind !== "sale" ? (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {active ? "Active" : "Ended"}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.customer.firstName} {row.customer.lastName} ·{" "}
                          {formatMoney(row.lineTotal, row.currency)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {tab === "sales"
                            ? `Paid ${formatDateTime(row.paidAt)} · Qty ${row.quantity}`
                            : `${formatDateTime(row.start)} → ${formatDateTime(row.end)}`}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Listing</th>
                        <th className="px-4 py-3">Customer</th>
                        {tab === "sales" ? (
                          <>
                            <th className="px-4 py-3">Paid</th>
                            <th className="px-4 py-3">Qty</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3">Start</th>
                            <th className="px-4 py-3">Ends</th>
                            <th className="px-4 py-3">Status</th>
                          </>
                        )}
                        <th className="px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayRows.map((row) => {
                        const active = row.kind !== "sale" && isBookingActive(row.end);
                        const selected = row.key === selectedKey;
                        return (
                          <tr
                            key={row.key}
                            onClick={() => handleSelect(row.key)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSelect(row.key);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-selected={selected}
                            className={`cursor-pointer transition outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                              selected
                                ? "bg-gradient-to-r from-blue-50/90 to-cyan-50/50"
                                : "bg-white hover:bg-slate-50/80"
                            }`}
                          >
                            <td className="max-w-[11rem] px-4 py-3.5 font-medium text-slate-900">
                              <span className="line-clamp-2">{row.listingTitle}</span>
                              <span className="mt-0.5 block font-mono text-[10px] font-normal text-slate-400">
                                {row.receiptNumber}
                              </span>
                            </td>
                            <td className="min-w-[10rem] px-4 py-3.5">
                              <div className="font-medium text-slate-800">
                                {row.customer.firstName} {row.customer.lastName}
                              </div>
                              <div className="truncate text-xs text-slate-500">
                                {row.customer.email}
                              </div>
                            </td>
                            {tab === "sales" ? (
                              <>
                                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                                  {formatDateTime(row.paidAt)}
                                </td>
                                <td className="px-4 py-3.5 text-slate-600">{row.quantity}</td>
                              </>
                            ) : (
                              <>
                                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                                  {formatDateTime(row.start)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                                  {formatDateTime(row.end)}
                                </td>
                                <td className="px-4 py-3.5">
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
                              </>
                            )}
                            <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">
                              {formatMoney(row.lineTotal, row.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-500">
                  {displayRows.length}{" "}
                  {tab === "sales" ? "sale" : "booking"}
                  {displayRows.length === 1 ? "" : "s"} · Click a row for details
                </p>
              </div>
            </div>

            {/* Desktop detail panel */}
            <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
              <ProviderBookingDetailPanel
                key={selectedKey ?? "none"}
                row={selectedRow}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
