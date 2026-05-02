"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import {
  deleteCartItem,
  patchCartItemQuantity,
  postSimulateCheckout,
} from "@/lib/marketplace-cart";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

function formatNaira(value: number): string {
  return `₦${naira.format(value)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, loading, refresh, itemCount, subtotalNgn } = useSessionAndCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const adjustQty = useCallback(
    async (serviceId: string, next: number) => {
      setError(null);
      if (next < 1) {
        return;
      }
      setBusy(true);
      try {
        await patchCartItemQuantity(serviceId, next);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update quantity");
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const removeLine = useCallback(
    async (serviceId: string) => {
      setError(null);
      setBusy(true);
      try {
        await deleteCartItem(serviceId);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove item");
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  async function handleSimulatedPaystack() {
    setError(null);
    setBusy(true);
    try {
      const { order } = await postSimulateCheckout();
      await refresh();
      router.push(`/receipts/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be completed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-4 sm:pt-6 lg:pt-8">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-foreground/70 sm:text-base">
            Paystack is not connected yet. Completing payment runs a temporary simulation
            only.
          </p>

          {loading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ambuhub-brand" aria-label="Loading" />
            </div>
          ) : !user ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/40 p-8 text-center">
              <p className="text-foreground/80">Log in to view your cart and check out.</p>
              <Link
                href="/auth"
                className="mt-4 inline-flex rounded-xl bg-ambuhub-brand px-5 py-2.5 text-sm font-semibold text-white"
              >
                Log in
              </Link>
            </div>
          ) : itemCount === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/40 p-8 text-center">
              <p className="text-foreground/80">Your cart is empty.</p>
              <Link
                href="/#services"
                className="mt-4 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline"
              >
                Browse services
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

              <ul className="divide-y divide-ambuhub-100 rounded-2xl border border-ambuhub-100 bg-white">
                {cart.items.map((row) => (
                  <li
                    key={row.serviceId}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{row.title}</p>
                      <p className="mt-1 text-xs text-foreground/60">
                        {row.category.name} · {row.departmentName}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {row.price != null ? formatNaira(row.price) : "—"} each
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <div className="inline-flex items-center rounded-xl border border-ambuhub-200 bg-white">
                        <button
                          type="button"
                          disabled={busy || row.quantity <= 1}
                          onClick={() => void adjustQty(row.serviceId, row.quantity - 1)}
                          className="p-2 text-foreground hover:bg-ambuhub-50 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold">
                          {row.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={
                            busy ||
                            row.stock == null ||
                            row.quantity >= row.stock
                          }
                          onClick={() => void adjustQty(row.serviceId, row.quantity + 1)}
                          className="p-2 text-foreground hover:bg-ambuhub-50 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeLine(row.serviceId)}
                        className="rounded-xl border border-ambuhub-200 p-2 text-foreground/70 hover:bg-red-50 hover:text-red-700"
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 rounded-2xl border border-ambuhub-200 bg-ambuhub-surface/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-foreground/70">Total (NGN)</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatNaira(subtotalNgn)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSimulatedPaystack()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark disabled:opacity-60 sm:w-auto"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Pay with Paystack (simulated)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
