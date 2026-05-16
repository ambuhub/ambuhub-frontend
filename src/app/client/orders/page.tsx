"use client";

import Link from "next/link";
import { ExternalLink, Loader2, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchMyOrders,
  type ClientOrderSummary,
} from "@/lib/client-orders";

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

function OrderNeonCard({ order }: { order: ClientOrderSummary }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/50 to-cyan-100/35 p-5 shadow-[0_0_32px_-6px_rgba(34,211,238,0.35),0_0_1px_rgba(0,105,180,0.12)] ring-1 ring-cyan-200/40">
      <div
        className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-sky-400/12 blur-2xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]" />

      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-white/70">
          <Receipt className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0369a1]">
            Receipt
          </p>
          <p className="font-mono text-sm font-bold tracking-tight text-[#0c4a6e]">
            {order.receiptNumber}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Total
          </span>
          <span className="bg-gradient-to-r from-[#004a7c] to-cyan-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
            {formatNgn(order.subtotalNgn)}
          </span>
        </p>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2 border-t border-cyan-100/80 pt-4 text-xs">
        <span className="inline-flex rounded-lg border border-cyan-200/60 bg-white/80 px-2.5 py-1 font-medium text-slate-700 shadow-sm ring-1 ring-cyan-100/50">
          Paid {formatDateTime(order.paidAt)}
        </span>
        <span className="inline-flex rounded-lg border border-sky-200/60 bg-sky-50/60 px-2.5 py-1 font-medium text-slate-700 ring-1 ring-sky-100/40">
          {order.lineCount} line{order.lineCount === 1 ? "" : "s"}
        </span>
      </div>

      <Link
        href={`/receipts/${encodeURIComponent(order.id)}`}
        className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-white/90 px-4 py-2.5 text-sm font-bold text-[#004a7c] shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)] transition hover:border-cyan-300 hover:bg-cyan-50/80 hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.45)]"
      >
        View receipt
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  );
}

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<ClientOrderSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchMyOrders();
        if (!cancelled) {
          setOrders(rows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load orders.");
          setOrders(null);
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
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          Orders
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Purchases and bookings you have made on Ambuhub. Open a receipt for the full breakdown.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-10">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-500" aria-label="Loading" />
        </div>
      ) : error ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900 shadow-[0_0_20px_-6px_rgba(239,68,68,0.2)]">
            {error}
          </div>
          {error.includes("Sign in") ? (
            <Link
              href={`/auth?next=${encodeURIComponent("/client/orders")}`}
              className="inline-flex rounded-lg border border-cyan-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/60"
            >
              Go to sign in
            </Link>
          ) : null}
        </div>
      ) : !orders?.length ? (
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-cyan-400/50 bg-white px-6 py-16 text-center shadow-[0_0_28px_-8px_rgba(34,211,238,0.25)]">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/15 blur-2xl"
            aria-hidden
          />
          <p className="relative text-slate-600">No orders yet.</p>
          <Link
            href="/#services"
            className="relative mt-4 inline-flex text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-cyan-700 hover:underline"
          >
            Browse services
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {orders.map((order) => (
            <OrderNeonCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
