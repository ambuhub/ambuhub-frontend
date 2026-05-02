"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  fetchReceiptByOrderId,
  type ReceiptDetailClient,
} from "@/lib/marketplace-cart";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

export default function ReceiptPage() {
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
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-ambuhub-brand" aria-label="Loading" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
              {error}
              <div className="mt-4">
                <Link href="/checkout" className="font-semibold text-ambuhub-brand hover:underline">
                  Back to checkout
                </Link>
              </div>
            </div>
          ) : receipt ? (
            <article className="rounded-2xl border border-ambuhub-200 bg-white p-6 shadow-sm sm:p-8">
              <header className="border-b border-ambuhub-100 pb-6">
                <p className="text-sm font-medium text-ambuhub-brand">Ambuhub receipt</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {receipt.receiptNumber}
                </h1>
                <p className="mt-2 text-sm text-foreground/65">
                  Issued {new Date(receipt.issuedAt).toLocaleString()}
                </p>
              </header>

              <section className="mt-6 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                  Items
                </h2>
                <ul className="divide-y divide-ambuhub-100 rounded-xl border border-ambuhub-100">
                  {receipt.lines.map((line) => (
                    <li
                      key={`${line.serviceId}-${line.title}`}
                      className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{line.title}</p>
                        <p className="text-xs text-foreground/55">
                          {line.categoryName} · {line.departmentName}
                        </p>
                        <p className="mt-1 text-xs text-foreground/60">
                          {line.quantity} × {formatNaira(line.unitPriceNgn)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-foreground sm:text-right">
                        {formatNaira(line.lineTotalNgn)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-6 rounded-xl bg-ambuhub-surface/60 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Subtotal ({receipt.currency})</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatNaira(receipt.subtotalNgn)}
                  </span>
                </div>
              </section>

              <section className="mt-6 text-sm text-foreground/70">
                <p>
                  <span className="font-medium text-foreground/80">Payment reference: </span>
                  {receipt.paystackReference}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-foreground/80">Provider: </span>
                  {receipt.paymentProvider === "paystack_simulated"
                    ? "Paystack (simulated)"
                    : receipt.paymentProvider}
                </p>
              </section>

              <footer className="mt-8 flex flex-col gap-3 border-t border-ambuhub-100 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border border-ambuhub-200 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-ambuhub-50"
                >
                  Print / Save as PDF
                </button>
                <Link
                  href="/#services"
                  className="inline-flex items-center justify-center rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-ambuhub-brand-dark"
                >
                  Continue shopping
                </Link>
              </footer>
            </article>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
