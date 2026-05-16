"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Heart,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ServiceCardImage } from "@/components/services/CategoryServiceListing";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { hasValidHireReturnWindow } from "@/lib/hire-return-window";
import { postCartItem } from "@/lib/marketplace-cart";
import {
  fetchMyFavoriteServices,
  removeFavoriteService,
} from "@/lib/service-favorites";
import {
  formatHirePricePeriodSuffix,
  isPricingPeriod,
} from "@/lib/pricing-period";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

const nairaNumberFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
});

function formatNaira(value: number): string {
  return `₦${nairaNumberFormatter.format(value)}`;
}

function formatListingTypeLabel(
  listingType: "sale" | "hire" | "book" | null,
): string {
  if (listingType === "sale") return "SALE";
  if (listingType === "hire") return "HIRE";
  if (listingType === "book") return "BOOK";
  return "N/A";
}

function formatStockLabel(
  listingType: "sale" | "hire" | "book" | null,
  stock: number | null,
): string {
  if (
    (listingType === "sale" || listingType === "hire") &&
    typeof stock === "number" &&
    Number.isFinite(stock)
  ) {
    return `Stock: ${stock}`;
  }
  return "Stock: N/A";
}

function isSalePurchasable(svc: MarketplaceServiceRow): boolean {
  return (
    svc.listingType === "sale" &&
    typeof svc.price === "number" &&
    typeof svc.stock === "number" &&
    svc.stock >= 1
  );
}

function isHireBookable(svc: MarketplaceServiceRow): boolean {
  return (
    svc.listingType === "hire" &&
    typeof svc.price === "number" &&
    svc.price >= 0 &&
    typeof svc.stock === "number" &&
    svc.stock >= 1 &&
    svc.pricingPeriod != null &&
    isPricingPeriod(svc.pricingPeriod) &&
    svc.isAvailable !== false &&
    hasValidHireReturnWindow(svc.hireReturnWindow)
  );
}

function FavoriteNeonCard({
  svc,
  loginHref,
  onRemove,
  removing,
  cart,
  sessionLoading,
  user,
  onAddToCart,
  addingToCart,
}: {
  svc: MarketplaceServiceRow;
  loginHref: string;
  onRemove: (id: string) => void;
  removing: boolean;
  cart: { items: { serviceId: string; quantity: number }[] };
  sessionLoading: boolean;
  user: unknown;
  onAddToCart: (id: string) => void;
  addingToCart: boolean;
}) {
  const detailHref = `/client/favorite/${encodeURIComponent(svc.id)}`;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-fuchsia-400/40 bg-gradient-to-br from-white via-fuchsia-50/40 to-rose-50/50 p-4 shadow-[0_0_32px_-8px_rgba(217,70,239,0.35)] ring-1 ring-fuchsia-200/45 sm:p-5">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-400/12 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-rose-300/15 blur-2xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-fuchsia-500 to-rose-400 shadow-[0_0_14px_rgba(217,70,239,0.45)]" />

      <div className="relative flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-fuchsia-200/60 bg-ambuhub-100 shadow-sm">
          <ServiceCardImage photoUrl={svc.photoUrls[0]} alt={svc.title} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-700/90">
            {formatListingTypeLabel(svc.listingType)}
          </p>
          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-[#0c4a6e] sm:text-base">
            {svc.title}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {formatStockLabel(svc.listingType, svc.stock)}
          </p>
        </div>
        <button
          type="button"
          disabled={removing}
          onClick={() => onRemove(svc.id)}
          className="relative shrink-0 rounded-xl border border-fuchsia-300/60 bg-white/90 p-2 text-fuchsia-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Remove from favorites"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      <div className="relative mt-3 min-h-0 flex-1">
        {svc.listingType === "sale" && typeof svc.price === "number" ? (
          <p className="text-sm font-bold text-[#004a7c]">{formatNaira(svc.price)}</p>
        ) : null}
        {svc.listingType === "hire" && typeof svc.price === "number" ? (
          <p className="text-sm font-bold text-[#004a7c]">
            {formatNaira(svc.price)}
            {svc.pricingPeriod ? (
              <span className="font-medium text-slate-600">
                {" "}
                ({formatHirePricePeriodSuffix(svc.pricingPeriod)})
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
          {svc.description}
        </p>
      </div>

      <div className="relative mt-4 flex flex-col gap-2 border-t border-fuchsia-100/90 pt-4">
        <Link
          href={detailHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/45 bg-white/95 px-4 py-2.5 text-xs font-bold text-[#004a7c] shadow-sm transition hover:border-fuchsia-300 hover:bg-fuchsia-50/60 sm:text-sm"
        >
          View details
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
        {isSalePurchasable(svc) ? (
          <div>
            {cart.items.some((i) => i.serviceId === svc.id) ? (
              <p className="mb-2 text-center text-[11px] font-semibold text-fuchsia-700">
                In cart:{" "}
                {cart.items.find((i) => i.serviceId === svc.id)?.quantity ?? 0}
              </p>
            ) : null}
            {sessionLoading ? (
              <p className="text-center text-xs text-slate-500">Checking session…</p>
            ) : user ? (
              <button
                type="button"
                onClick={() => onAddToCart(svc.id)}
                disabled={addingToCart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0069b4] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#004a7c] disabled:opacity-60 sm:text-sm"
              >
                {addingToCart ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <ShoppingCart className="h-4 w-4" aria-hidden />
                )}
                Add to cart
              </button>
            ) : (
              <Link
                href={loginHref}
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#0069b4] bg-white px-4 py-2.5 text-xs font-bold text-[#0069b4] sm:text-sm"
              >
                Log in to purchase
              </Link>
            )}
          </div>
        ) : null}
        {svc.listingType === "hire" ? (
          isHireBookable(svc) ? (
            sessionLoading ? (
              <p className="text-center text-xs text-slate-500">Checking session…</p>
            ) : user ? (
              <Link
                href={`/hire/${svc.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0069b4] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#004a7c] sm:text-sm"
              >
                Hire now
              </Link>
            ) : (
              <Link
                href={`/auth?next=${encodeURIComponent(`/hire/${svc.id}`)}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#0069b4] bg-white px-4 py-2.5 text-xs font-bold text-[#0069b4] sm:text-sm"
              >
                Log in to hire
              </Link>
            )
          ) : (
            <p className="text-center text-xs text-slate-500">
              This hire listing is not available.
            </p>
          )
        ) : null}
        {svc.listingType === "book" ? (
          <p className="text-center text-xs text-slate-600">
            <Link href={detailHref} className="font-semibold text-[#0069b4] underline">
              Listing details
            </Link>{" "}
            shows all photos and the full description. To book, use the{" "}
            <Link
              href={`/services/${encodeURIComponent(svc.category.slug)}`}
              className="font-semibold text-[#0069b4] underline"
            >
              {svc.category.name}
            </Link>{" "}
            category page.
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function ClientFavoritePage() {
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/client/favorite")}`;
  const { user, cart, loading: sessionLoading, refresh } = useSessionAndCart();
  const [services, setServices] = useState<MarketplaceServiceRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchMyFavoriteServices();
      setServices(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load favorites.");
      setServices(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      const rows = await removeFavoriteService(id);
      setServices(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove favorite.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(serviceId: string) {
    setAddingToCartId(serviceId);
    try {
      await postCartItem(serviceId, 1);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to cart.");
    } finally {
      setAddingToCartId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] via-fuchsia-600 to-rose-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            <Heart className="h-8 w-8 text-fuchsia-500 sm:h-9 sm:w-9" fill="currentColor" aria-hidden />
            Favorites
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Marketplace listings you saved for quick access. Open a category or hire flow
            when you are ready.
          </p>
        </div>
        <Link
          href="/#services"
          className="text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-fuchsia-700 hover:underline"
        >
          Browse services
        </Link>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center py-12">
          <Loader2
            className="h-10 w-10 animate-spin text-fuchsia-500"
            aria-label="Loading"
          />
        </div>
      ) : error ? (
        <div className="mt-8 space-y-3" role="alert">
          <div className="rounded-2xl border border-red-300/50 bg-gradient-to-br from-red-50 to-white px-4 py-3 text-sm text-red-900 shadow-[0_0_20px_-6px_rgba(239,68,68,0.2)]">
            {error}
          </div>
          {error.includes("Sign in") ? (
            <Link
              href={loginHref}
              className="inline-flex rounded-lg border border-fuchsia-400/40 bg-white px-3 py-2 text-sm font-semibold text-[#0069b4] shadow-sm transition hover:border-fuchsia-300 hover:bg-fuchsia-50/60"
            >
              Go to sign in
            </Link>
          ) : null}
        </div>
      ) : !services?.length ? (
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-fuchsia-400/45 bg-white px-6 py-16 text-center shadow-[0_0_28px_-8px_rgba(217,70,239,0.25)]">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-fuchsia-400/15 blur-2xl"
            aria-hidden
          />
          <p className="relative text-slate-600">
            You have not saved any listings yet. Use the heart on a service card while
            browsing to add it here.
          </p>
          <Link
            href="/#services"
            className="relative mt-4 inline-flex text-sm font-semibold text-[#0069b4] underline-offset-4 hover:text-fuchsia-700 hover:underline"
          >
            Explore the marketplace
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {services.map((svc) => (
            <li key={svc.id}>
              <FavoriteNeonCard
                svc={svc}
                loginHref={loginHref}
                onRemove={(id) => void handleRemove(id)}
                removing={removingId === svc.id}
                cart={cart}
                sessionLoading={sessionLoading}
                user={user}
                onAddToCart={(id) => void handleAddToCart(id)}
                addingToCart={addingToCartId === svc.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
