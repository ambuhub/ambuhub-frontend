"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Receipt } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import { fetchAdminOrderReceipt } from "@/lib/admin-orders";
import type { ReceiptDetailClient } from "@/lib/marketplace-cart";
import { formatPricingPeriodLabel, isPricingPeriod } from "@/lib/pricing-period";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

export default function AdminOrderReceiptPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  const [receipt, setReceipt] = useState<ReceiptDetailClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReceipt = useCallback(async () => {
    if (!orderId) {
      setError("Invalid order id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrderReceipt(orderId);
      setReceipt(data);
    } catch (err) {
      setReceipt(null);
      setError(err instanceof Error ? err.message : "Could not load receipt.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadReceipt();
  }, [loadReceipt]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/admin/orders/${encodeURIComponent(orderId)}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to order
      </Link>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : receipt ? (
        <>
          <AdminPageHeader
            theme="blue"
            title={receipt.receiptNumber}
            description={`Issued ${new Date(receipt.issuedAt).toLocaleString()}`}
          />

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:border-slate-300 print:shadow-none">
            <header className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-sky-50/90 to-indigo-100/50 px-6 py-5 print:bg-white">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm print:shadow-none">
                  <Receipt className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-900">
                    <FileText className="h-3 w-3 text-indigo-600" aria-hidden />
                    Ambuhub receipt
                  </span>
                  <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {receipt.receiptNumber}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Issued{" "}
                    <span className="font-medium text-slate-800">
                      {new Date(receipt.issuedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </header>

            <section className="px-6 py-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-800">
                Items
              </h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 print:divide-slate-200 print:border-slate-200 print:bg-white">
                {receipt.lines.map((line, lineIndex) => (
                  <li
                    key={`${line.serviceId}-${lineIndex}`}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 gap-3 sm:gap-4">
                      {line.primaryPhotoUrl ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-24 sm:w-24 print:border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={line.primaryPhotoUrl}
                            alt={line.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-[10px] font-semibold text-slate-400 sm:h-24 sm:w-24"
                          aria-hidden
                        >
                          No photo
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{line.title}</p>
                        <p className="text-xs text-slate-500">
                          {line.categoryName} · {line.departmentName}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {line.lineKind === "hire" &&
                          typeof line.hireBillableUnits === "number" ? (
                            <>
                              {line.quantity} × {formatNaira(line.unitPriceNgn)} ×{" "}
                              {line.hireBillableUnits}{" "}
                              {line.pricingPeriod && isPricingPeriod(line.pricingPeriod)
                                ? formatPricingPeriodLabel(line.pricingPeriod).toLowerCase()
                                : "units"}
                            </>
                          ) : (
                            <>
                              {line.quantity} × {formatNaira(line.unitPriceNgn)}
                            </>
                          )}
                        </p>
                        {line.lineKind === "hire" && line.hireStart && line.hireEnd ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(line.hireStart).toLocaleString()} →{" "}
                            {new Date(line.hireEnd).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <p className="shrink-0 text-base font-bold text-slate-900 sm:pt-1 sm:text-right">
                      {formatNaira(line.lineTotalNgn)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mx-6 mb-6 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-700 via-indigo-800 to-sky-900 px-5 py-5 print:border-slate-300 print:bg-slate-100 print:[background-image:none]">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-indigo-100 print:text-slate-700">
                  Subtotal ({receipt.currency})
                </span>
                <span className="text-xl font-bold text-white print:text-slate-900">
                  {formatNaira(receipt.subtotalNgn)}
                </span>
              </div>
            </section>

            <section className="mx-6 mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 print:border-slate-200 print:bg-white">
              <p>
                <span className="font-semibold text-slate-800">Payment reference: </span>
                <span className="font-mono text-slate-800">{receipt.paystackReference}</span>
              </p>
              <p className="mt-2">
                <span className="font-semibold text-slate-800">Provider: </span>
                {receipt.paymentProvider === "paystack_simulated"
                  ? "Paystack (simulated)"
                  : receipt.paymentProvider}
              </p>
            </section>

            <footer className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-between print:border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 print:hidden"
              >
                Print / Save as PDF
              </button>
              <Link
                href={`/admin/orders/${encodeURIComponent(orderId)}`}
                className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 print:hidden"
              >
                Back to order
              </Link>
            </footer>
          </article>
        </>
      ) : null}
    </div>
  );
}
