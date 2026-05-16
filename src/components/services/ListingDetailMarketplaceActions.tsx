"use client";

import Link from "next/link";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { isBookBookable } from "@/lib/book-bookable";
import { hasValidHireReturnWindow } from "@/lib/hire-return-window";
import { postCartItem } from "@/lib/marketplace-cart";
import {
  addFavoriteService,
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

type Props = {
  service: MarketplaceServiceRow;
  authReturnPath: string;
  variant?: "public" | "client";
};

const neonNoticeOk =
  "rounded-xl border border-cyan-300/50 bg-cyan-50/80 px-4 py-3 text-sm text-[#0c4a6e] shadow-[0_0_20px_-6px_rgba(34,211,238,0.25)]";
const neonNoticeErr =
  "rounded-xl border border-amber-300/55 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-[0_0_16px_-8px_rgba(251,191,36,0.2)]";

const neonSecondaryBtn =
  "inline-flex items-center gap-2 rounded-xl border border-cyan-400/45 bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#004a7c] shadow-[0_0_18px_-6px_rgba(34,211,238,0.22)] ring-1 ring-cyan-100/50 transition hover:border-cyan-300 hover:bg-cyan-50/80 hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.32)] disabled:cursor-not-allowed disabled:opacity-60";

const neonPrimaryBtn =
  "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_28px_-4px_rgba(34,211,238,0.45)] transition hover:from-[#003d66] hover:via-[#005a96] hover:to-cyan-700 hover:shadow-[0_0_32px_-2px_rgba(34,211,238,0.5)] disabled:opacity-60 sm:w-auto";

const neonBlock =
  "rounded-2xl border border-cyan-300/40 bg-white/80 p-5 shadow-[0_0_24px_-8px_rgba(34,211,238,0.28)] ring-1 ring-sky-100/50";

export function ListingDetailMarketplaceActions({
  service,
  authReturnPath,
  variant = "client",
}: Props) {
  const isPublic = variant === "public";
  const loginHref = `/auth?next=${encodeURIComponent(authReturnPath)}`;
  const {
    user,
    cart,
    loading: sessionLoading,
    refresh,
  } = useSessionAndCart();

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [favoritesLoadState, setFavoritesLoadState] = useState<
    "idle" | "loading" | "ready"
  >("idle");
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) {
      return;
    }
    if (!user) {
      setFavoriteIds(new Set());
      setFavoritesLoadState("ready");
      return;
    }
    let cancelled = false;
    setFavoritesLoadState("loading");
    (async () => {
      try {
        const rows = await fetchMyFavoriteServices();
        if (!cancelled) {
          setFavoriteIds(new Set(rows.map((r) => r.id)));
        }
      } catch {
        if (!cancelled) {
          setFavoriteIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setFavoritesLoadState("ready");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, sessionLoading]);

  const handleToggleFavorite = useCallback(async () => {
    if (!user || favoritesLoadState !== "ready") {
      return;
    }
    setFavoriteBusy(true);
    setNotice(null);
    try {
      const isFav = favoriteIds.has(service.id);
      const rows = isFav
        ? await removeFavoriteService(service.id)
        : await addFavoriteService(service.id);
      setFavoriteIds(new Set(rows.map((r) => r.id)));
      setNotice(isFav ? "Removed from favorites." : "Saved to favorites.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not update favorites.");
    } finally {
      setFavoriteBusy(false);
    }
  }, [user, favoritesLoadState, favoriteIds, service.id]);

  async function handleAddToCart() {
    setCartBusy(true);
    setNotice(null);
    try {
      await postCartItem(service.id, 1);
      await refresh();
      setNotice("Added to cart.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not add to cart.");
    } finally {
      setCartBusy(false);
    }
  }

  useEffect(() => {
    if (!notice) return;
    const ok =
      notice.startsWith("Added") ||
      notice.startsWith("Saved") ||
      notice.startsWith("Removed");
    const ms = ok ? 3500 : 8000;
    const t = window.setTimeout(() => setNotice(null), ms);
    return () => window.clearTimeout(t);
  }, [notice]);

  const hireHref = `/hire/${encodeURIComponent(service.id)}`;
  const bookHref = `/book/${encodeURIComponent(service.id)}`;
  const categoryPublicHref = `/services/${encodeURIComponent(service.category.slug)}`;

  const noticeClass =
    notice?.startsWith("Added") ||
    notice?.startsWith("Saved") ||
    notice?.startsWith("Removed")
      ? isPublic
        ? neonNoticeOk
        : "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-950"
      : isPublic
        ? neonNoticeErr
        : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950";

  const favBtnClass = isPublic
    ? neonSecondaryBtn
    : "inline-flex items-center gap-2 rounded-xl border border-ambuhub-brand bg-white px-4 py-2.5 text-sm font-semibold text-ambuhub-brand transition hover:bg-ambuhub-50 disabled:cursor-not-allowed disabled:opacity-60";

  const moreBtnClass = isPublic
    ? neonSecondaryBtn
    : "inline-flex items-center justify-center rounded-xl border border-ambuhub-200 bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-ambuhub-50";

  const saleBlockClass = isPublic
    ? neonBlock
    : "rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm";

  const primaryBtnClass = isPublic
    ? neonPrimaryBtn
    : "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ambuhub-brand-dark disabled:opacity-60 sm:w-auto";

  const loginBtnClass = isPublic
    ? `${neonSecondaryBtn} mt-3 w-full sm:w-auto`
    : "mt-3 inline-flex w-full items-center justify-center rounded-xl border border-ambuhub-brand bg-white px-4 py-2.5 text-sm font-semibold text-ambuhub-brand sm:w-auto";

  return (
    <div className="space-y-4">
      {notice ? (
        <p role="alert" className={noticeClass}>
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {sessionLoading ? (
          <p className="text-sm text-foreground/60">Checking session…</p>
        ) : user ? (
          <button
            type="button"
            disabled={
              favoritesLoadState !== "ready" || favoriteBusy
            }
            onClick={() => void handleToggleFavorite()}
            className={favBtnClass}
          >
            {favoriteBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Heart
                className={`h-4 w-4 ${
                  favoriteIds.has(service.id)
                    ? "fill-red-500 text-red-500"
                    : ""
                }`}
                aria-hidden
              />
            )}
            {favoriteIds.has(service.id)
              ? "Remove from favorites"
              : "Add to favorites"}
          </button>
        ) : (
          <Link href={loginHref} className={favBtnClass}>
            <Heart className="h-4 w-4" aria-hidden />
            Sign in to save favorites
          </Link>
        )}

        <Link href={categoryPublicHref} className={moreBtnClass}>
          More in this category
        </Link>
      </div>

      {isSalePurchasable(service) ? (
        <div className={saleBlockClass}>
          <p className="text-sm font-semibold text-foreground">
            {formatNaira(service.price as number)}
          </p>
          {cart.items.some((i) => i.serviceId === service.id) ? (
            <p className="mt-1 text-xs font-semibold text-ambuhub-brand">
              In cart:{" "}
              {cart.items.find((i) => i.serviceId === service.id)?.quantity ?? 0}
            </p>
          ) : null}
          {sessionLoading ? (
            <p className="mt-2 text-xs text-foreground/55">Checking session…</p>
          ) : user ? (
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={cartBusy}
              className={primaryBtnClass}
            >
              {cartBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ShoppingCart className="h-4 w-4" aria-hidden />
              )}
              Add to cart
            </button>
          ) : (
            <Link href={loginHref} className={loginBtnClass}>
              Log in to purchase
            </Link>
          )}
        </div>
      ) : null}

      {service.listingType === "hire" ? (
        <div className={saleBlockClass}>
          {typeof service.price === "number" && service.pricingPeriod ? (
            <p className="text-sm font-semibold text-foreground">
              {formatNaira(service.price)}
              {isPricingPeriod(service.pricingPeriod) ? (
                <span className="font-medium text-foreground/80">
                  {" "}
                  ({formatHirePricePeriodSuffix(service.pricingPeriod)})
                </span>
              ) : null}
            </p>
          ) : null}
          {isHireBookable(service) ? (
            sessionLoading ? (
              <p className="mt-2 text-xs text-foreground/55">Checking session…</p>
            ) : user ? (
              <Link href={hireHref} className={primaryBtnClass}>
                Hire now
              </Link>
            ) : (
              <Link
                href={`/auth?next=${encodeURIComponent(hireHref)}`}
                className={loginBtnClass}
              >
                Log in to hire
              </Link>
            )
          ) : (
            <p className="mt-2 text-xs text-foreground/60">
              This hire listing is not available for checkout right now.
            </p>
          )}
        </div>
      ) : null}

      {service.listingType === "book" ? (
        <div className={isPublic ? neonBlock : "mt-4"}>
          {isBookBookable(service) ? (
            sessionLoading ? (
              <p className="text-xs text-foreground/55">Checking session…</p>
            ) : user ? (
              <Link href={bookHref} className={primaryBtnClass}>
                Book now
              </Link>
            ) : (
              <Link
                href={`/auth?next=${encodeURIComponent(bookHref)}`}
                className={loginBtnClass}
              >
                Log in to book
              </Link>
            )
          ) : (
            <p className="text-sm text-foreground/75">
              This listing is not available for booking right now.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
