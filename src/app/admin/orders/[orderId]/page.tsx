"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Receipt,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminOrderDetail,
  type AdminOrderDetail,
  type AdminOrderLineKind,
} from "@/lib/admin-orders";

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

function buyerName(order: AdminOrderDetail): string {
  const name = `${order.buyer.firstName} ${order.buyer.lastName}`.trim();
  return name || order.buyer.email || "Unknown buyer";
}

function kindLabel(kind: AdminOrderLineKind | "mixed" | null): string {
  if (kind === "mixed") return "Mixed";
  if (kind === "hire") return "Hire";
  if (kind === "book") return "Book";
  if (kind === "sale") return "Sale";
  return "—";
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("Invalid order id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Could not load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to orders
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
      ) : order ? (
        <>
          <AdminPageHeader
            theme="blue"
            title={order.receiptNumber}
            description={`${kindLabel(order.primaryLineKind)} order · Paid ${formatDateTime(order.paidAt)} · ${formatNgn(order.subtotalNgn)}`}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Order summary
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Receipt</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                    {order.receiptNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Total</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {formatNgn(order.subtotalNgn)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Paid at</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDateTime(order.paidAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Created</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDateTime(order.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Payment</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {order.paymentProvider}
                    {order.paystackSimulated ? " (simulated)" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Reference</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                    {order.paystackReference}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-sky-50/90 to-indigo-100/50 p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <User className="h-4 w-4" aria-hidden />
                Buyer
              </h2>
              <div className="mt-4 space-y-2 text-sm text-slate-800">
                <p className="font-semibold text-slate-900">{buyerName(order)}</p>
                <p>{order.buyer.email || "—"}</p>
                <p>{order.buyer.phone || "—"}</p>
                <p>{order.buyer.countryCode || "—"}</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/admin/users/${encodeURIComponent(order.buyer.id)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
                >
                  View buyer profile
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.id)}/receipt`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
                >
                  View receipt
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Receipt className="h-5 w-5 text-indigo-600" aria-hidden />
                Line items
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {order.lines.length} line{order.lines.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Item
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Seller
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line, index) => (
                    <tr
                      key={`${line.serviceId}-${index}`}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{line.title}</p>
                        <p className="text-xs text-slate-500">
                          {line.categoryName} · {line.departmentName}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-700">
                        {kindLabel(line.lineKind)}
                      </td>
                      <td className="px-5 py-3">
                        {line.sellerUserId ? (
                          <Link
                            href={`/admin/users/${encodeURIComponent(line.sellerUserId)}`}
                            className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                          >
                            {line.sellerName ?? "View seller"}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-700">
                        {line.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                        {formatNgn(line.lineTotalNgn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
