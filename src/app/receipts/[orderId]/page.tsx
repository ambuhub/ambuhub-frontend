"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  fetchReceiptByOrderId,
  type ReceiptDetailClient,
} from "@/lib/marketplace-cart";
import { formatPricingPeriodLabel, isPricingPeriod } from "@/lib/pricing-period";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

export default function ReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const [receipt, setReceipt] = useState<ReceiptDetailClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Invalid receipt link.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReceiptByOrderId(orderId);
        if (!cancelled) {
          setReceipt(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load receipt");
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
  }, [orderId]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50/90">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="group mb-4 inline-flex items-center gap-2 rounded-xl border border-cyan-300/55 bg-white/90 px-3 py-2 text-sm font-semibold text-[#004a7c] shadow-sm shadow-cyan-500/10 ring-1 ring-cyan-100/60 transition hover:border-cyan-400 hover:bg-cyan-50/80 hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.25)] print:hidden"
            aria-label="Go back to previous page"
          >
            <ArrowLeft
              className="h-4 w-4 transition group-hover:-translate-x-0.5"
              aria-hidden
            />
            Back
          </button>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
            </div>
          ) : error ? (
            <div className="relative overflow-hidden rounded-2xl border border-red-300/45 bg-gradient-to-br from-red-50 to-white p-6 text-sm text-red-900 shadow-[0_0_24px_-8px_rgba(239,68,68,0.25)]">
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-200/30 blur-2xl print:hidden"
                aria-hidden
              />
              <p className="relative">{error}</p>
              <div className="relative mt-4">
                <Link
                  href="/checkout"
                  className="inline-flex rounded-lg border border-cyan-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:bg-cyan-50/60"
                >
                  Back to checkout
                </Link>
              </div>
            </div>
          ) : receipt ? (
            <article
              className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/30 p-6 shadow-[0_0_36px_-8px_rgba(34,211,238,0.35),0_0_1px_rgba(0,105,180,0.12)] ring-1 ring-cyan-200/40 print:border-slate-300 print:bg-white print:shadow-none print:ring-0 sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-cyan-400/18 blur-3xl print:hidden"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl print:hidden"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_16px_rgba(34,211,238,0.55)] print:hidden" />

              <header className="relative border-b border-cyan-100/80 pb-6 print:border-slate-200">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg shadow-cyan-500/35 ring-2 ring-white/80 print:shadow-none">
                    <Receipt className="h-6 w-6" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-50/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#0c4a6e] shadow-sm">
                      <FileText className="h-3 w-3 text-cyan-600" aria-hidden />
                      Ambuhub receipt
                    </span>
                    <h1 className="mt-3 font-mono text-2xl font-bold tracking-tight text-[#0c4a6e] sm:text-3xl">
                      <span className="bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-transparent print:bg-none print:text-slate-900">
                        {receipt.receiptNumber}
                      </span>
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

              <section className="relative mt-8 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0369a1]">
                  Items
                </h2>
                <ul className="divide-y divide-cyan-100/90 rounded-2xl border border-cyan-200/50 bg-white/70 shadow-inner ring-1 ring-cyan-100/60 print:divide-slate-200 print:border-slate-200 print:bg-white print:shadow-none print:ring-0">
                  {receipt.lines.map((line, lineIndex) => (
                    <li
                      key={`${line.serviceId}-${lineIndex}`}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <div className="flex min-w-0 gap-3 sm:gap-4">
                        {line.primaryPhotoUrl ? (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-cyan-400/45 bg-slate-100 shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)] ring-1 ring-white/80 sm:h-24 sm:w-24 print:border-slate-200 print:shadow-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={line.primaryPhotoUrl}
                              alt={line.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-cyan-200/70 bg-gradient-to-br from-sky-50/80 to-white text-[10px] font-semibold text-slate-400 sm:h-24 sm:w-24 print:border-slate-200"
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
                      <div className="flex shrink-0 flex-col items-end gap-2 sm:pt-1">
                        <p className="bg-gradient-to-r from-[#004a7c] to-cyan-600 bg-clip-text text-base font-bold text-transparent sm:text-right print:bg-none print:text-slate-900">
                          {formatNaira(line.lineTotalNgn)}
                        </p>
                        <Link
                          href={`/client/reviews?orderId=${encodeURIComponent(receipt.orderId)}&serviceId=${encodeURIComponent(line.serviceId)}`}
                          className="text-xs font-semibold text-[#0069b4] underline-offset-2 hover:text-cyan-700 hover:underline print:hidden"
                        >
                          Leave a review
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="relative mt-8 overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-[#031d3d] via-[#053558] to-[#0a5c7a] px-5 py-5 shadow-[0_0_32px_-4px_rgba(34,211,238,0.4)] ring-1 ring-cyan-400/25 print:border-slate-300 print:bg-slate-100 print:shadow-none print:ring-0 print:[background-image:none]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 print:hidden"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 80% 120%, rgba(34,211,238,0.3), transparent 50%)",
                  }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-sky-200/95 print:text-slate-700">
                    Subtotal ({receipt.currency})
                  </span>
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-sky-100 bg-clip-text text-xl font-bold text-transparent print:bg-none print:text-slate-900">
                    {formatNaira(receipt.subtotalNgn)}
                  </span>
                </div>
              </section>

              <section className="relative mt-6 rounded-xl border border-cyan-200/40 bg-white/60 px-4 py-4 text-sm text-slate-600 ring-1 ring-cyan-50 print:border-slate-200 print:bg-white print:ring-0">
                <p>
                  <span className="font-semibold text-[#0c4a6e]">Payment reference: </span>
                  <span className="font-mono text-slate-800">{receipt.paystackReference}</span>
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-[#0c4a6e]">Provider: </span>
                  {receipt.paymentProvider === "paystack_simulated"
                    ? "Paystack (simulated)"
                    : receipt.paymentProvider}
                </p>
              </section>

              <footer className="relative mt-8 flex flex-col gap-3 border-t border-cyan-100/80 pt-6 sm:flex-row sm:justify-between print:border-slate-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-cyan-300/60 bg-white px-4 py-2.5 text-sm font-bold text-[#004a7c] shadow-[0_0_16px_-4px_rgba(34,211,238,0.2)] transition hover:border-cyan-400 hover:bg-cyan-50/80 print:hidden"
                >
                  Print / Save as PDF
                </button>
                <Link
                  href="/#services"
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-400/50 bg-gradient-to-r from-[#0069b4] to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)] transition hover:from-[#0078c9] hover:to-cyan-500 print:hidden"
                >
                  Continue shopping
                </Link>
                <p className="hidden text-center text-xs text-slate-500 print:block">
                  Thank you for using Ambuhub.
                </p>
              </footer>
            </article>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
