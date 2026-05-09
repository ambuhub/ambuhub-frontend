"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Search, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { API_PROXY_PREFIX } from "@/lib/api";
import { FALLBACK_THUMB, isCloudinaryHost } from "@/lib/landing-service-categories";
import { AMBUHUB_SERVICES } from "@/lib/ambuhub-services";
import { postCartItem } from "@/lib/marketplace-cart";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import {
  getCategoryPageTitleDescription,
  groupMarketplaceByDepartments,
  type DepartmentServiceSection,
  type MarketplaceServiceRow,
  type ServiceCategoryPageDto,
} from "@/lib/service-category-page-data";

const BANNER_SIZES = "100vw";
const CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

const bannerImgBase = "h-full w-full object-cover";
const nairaNumberFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
});

function formatNaira(value: number): string {
  return `₦${nairaNumberFormatter.format(value)}`;
}

type ListingTypeFilter = "all" | "sale" | "hire" | "book" | "none";

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function formatListingTypeLabel(listingType: "sale" | "hire" | "book" | null): string {
  if (listingType === "sale") {
    return "SALE";
  }
  if (listingType === "hire") {
    return "HIRE";
  }
  if (listingType === "book") {
    return "BOOK";
  }
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
    svc.isAvailable !== false
  );
}

const TALL_TOP_BIAS_BANNER_SLUGS = new Set([
  "personnel",
  "medical-transport",
  "ambulance-servicing",
  "ambulance-equipment",
]);

/** Taller shell + top-biased crop (same as landing Personnel card treatment). */
function categoryBannerImageClass(categorySlug: string): string {
  const position = TALL_TOP_BIAS_BANNER_SLUGS.has(categorySlug)
    ? " object-[center_22%]"
    : " object-center";
  return bannerImgBase + position;
}

function CategoryBannerImage({
  src,
  alt,
  categorySlug,
}: {
  src: string;
  alt: string;
  categorySlug: string;
}) {
  const trimmed = src.trim();
  const imgClass = categoryBannerImageClass(categorySlug);

  if (trimmed.startsWith("/")) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        priority
        className={imgClass}
        sizes={BANNER_SIZES}
      />
    );
  }

  if (trimmed.startsWith("http") && isCloudinaryHost(trimmed)) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        priority
        className={imgClass}
        sizes={BANNER_SIZES}
      />
    );
  }

  if (trimmed.startsWith("http")) {
    return (
      <img
        src={trimmed}
        alt={alt}
        className={`absolute inset-0 ${imgClass}`}
      />
    );
  }

  return (
    <Image
      src={FALLBACK_THUMB}
      alt={alt}
      fill
      priority
      className={imgClass}
      sizes={BANNER_SIZES}
    />
  );
}

function ServiceCardImage({
  photoUrl,
  alt,
}: {
  photoUrl?: string | null;
  alt: string;
}) {
  const src = photoUrl?.trim();

  if (!src) {
    return (
      <Image
        src={FALLBACK_THUMB}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("http") && isCloudinaryHost(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={CARD_SIZES}
      />
    );
  }

  if (src.startsWith("http")) {
    return (
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <Image
      src={FALLBACK_THUMB}
      alt={alt}
      fill
      className="object-cover object-center"
      sizes={CARD_SIZES}
    />
  );
}

type Props = {
  category: ServiceCategoryPageDto;
  sections: DepartmentServiceSection[];
};

export function CategoryServiceListing({ category, sections }: Props) {
  const pathname = usePathname();
  const loginHref = `/auth?next=${encodeURIComponent(pathname || "/")}`;
  const { title, description } = getCategoryPageTitleDescription(category);
  const bannerSrc =
    category.bannerUrl?.trim() ||
    category.thumbnailUrl?.trim() ||
    "";
  const {
    user,
    cart,
    loading: sessionLoading,
    refresh,
    itemCount,
    subtotalNgn,
  } = useSessionAndCart();
  const [liveSections, setLiveSections] = useState(sections);
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [listingTypeFilter, setListingTypeFilter] =
    useState<ListingTypeFilter>("all");

  useEffect(() => {
    setLiveSections(sections);
  }, [sections]);

  const refetchMarketplaceSections = useCallback(async () => {
    try {
      const res = await fetch(`${API_PROXY_PREFIX}/services/marketplace`, {
        cache: "no-store",
        credentials: "omit",
      });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { services?: MarketplaceServiceRow[] };
      const rows = Array.isArray(data.services) ? data.services : [];
      setLiveSections(groupMarketplaceByDepartments(category, rows));
    } catch {
      /* keep current liveSections */
    }
  }, [category]);

  useEffect(() => {
    void refetchMarketplaceSections();
  }, [category.slug, refetchMarketplaceSections]);

  useEffect(() => {
    function onInvalidate() {
      void refetchMarketplaceSections();
    }
    window.addEventListener(AMBUHUB_MARKETPLACE_INVALIDATE_EVENT, onInvalidate);
    return () => {
      window.removeEventListener(
        AMBUHUB_MARKETPLACE_INVALIDATE_EVENT,
        onInvalidate,
      );
    };
  }, [refetchMarketplaceSections]);

  useEffect(() => {
    if (!cartNotice) {
      return;
    }
    const isSuccess = cartNotice.startsWith("Added");
    const ms = isSuccess ? 3500 : 9000;
    const id = window.setTimeout(() => setCartNotice(null), ms);
    return () => window.clearTimeout(id);
  }, [cartNotice]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const departmentOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const d of category.departments) {
      options.set(d.slug, d.name);
    }

    for (const section of liveSections) {
      if (!options.has(section.key)) {
        options.set(section.key, section.heading);
      }
    }

    return Array.from(options.entries()).map(([slug, label]) => ({
      slug,
      label,
    }));
  }, [category.departments, liveSections]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    function matchesListingType(service: MarketplaceServiceRow): boolean {
      if (listingTypeFilter === "all") {
        return true;
      }
      if (listingTypeFilter === "none") {
        return service.listingType === null;
      }
      return service.listingType === listingTypeFilter;
    }

    function matchesSearch(
      service: MarketplaceServiceRow,
      section: DepartmentServiceSection,
    ): boolean {
      if (!normalizedQuery) {
        return true;
      }

      const searchableParts = [
        service.title,
        service.description,
        service.departmentName,
        service.departmentSlug,
        service.category.name,
        service.category.slug,
        section.heading,
        service.listingType ?? "not specified",
        typeof service.price === "number" ? String(service.price) : "",
        typeof service.stock === "number" ? String(service.stock) : "",
        service.pricingPeriod
          ? formatPricingPeriodLabel(service.pricingPeriod)
          : "",
        service.pricingPeriod ?? "",
      ];

      const haystack = normalizeSearchText(searchableParts.join(" "));
      return haystack.includes(normalizedQuery);
    }

    return liveSections
      .map((section) => {
        if (departmentFilter !== "all" && section.key !== departmentFilter) {
          return null;
        }

        const services = section.services.filter(
          (service) => matchesListingType(service) && matchesSearch(service, section),
        );
        if (services.length === 0) {
          return null;
        }

        return {
          ...section,
          services,
        };
      })
      .filter((section): section is DepartmentServiceSection => section !== null);
  }, [departmentFilter, listingTypeFilter, searchQuery, liveSections]);

  const tallBannerShellClass =
    "relative mt-6 h-56 max-h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-ambuhub-100 to-ambuhub-200/80 sm:mt-8 sm:h-72 md:mt-10 md:h-96";
  const defaultBannerShellClass =
    "relative mt-6 h-40 max-h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-ambuhub-100 to-ambuhub-200/80 sm:mt-8 sm:h-52 md:mt-10 md:h-64";
  const bannerShellClass = TALL_TOP_BIAS_BANNER_SLUGS.has(category.slug)
    ? tallBannerShellClass
    : defaultBannerShellClass;

  async function handleAddToCart(serviceId: string) {
    setAddingServiceId(serviceId);
    setCartNotice(null);
    try {
      await postCartItem(serviceId, 1);
      await refresh();
      setCartNotice("Added to cart.");
    } catch (err) {
      setCartNotice(err instanceof Error ? err.message : "Could not add to cart.");
    } finally {
      setAddingServiceId(null);
    }
  }

  const listingBottomPad =
    itemCount > 0 ? "pb-28 sm:pb-20" : "pb-14 sm:pb-16 lg:pb-20";

  const cartNoticeIsSuccess = cartNotice?.startsWith("Added") ?? false;

  return (
    <>
      {cartNotice ? (
        <div
          className="fixed left-1/2 top-20 z-[60] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 px-0 sm:top-24"
          role="alert"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${
              cartNoticeIsSuccess
                ? "border-green-200/90 bg-green-50/95 text-green-950"
                : "border-amber-200/90 bg-amber-50/95 text-amber-950"
            }`}
          >
            <p className="min-w-0 flex-1 text-sm leading-relaxed">{cartNotice}</p>
            <button
              type="button"
              onClick={() => setCartNotice(null)}
              className={`shrink-0 rounded-lg p-1 transition-colors ${
                cartNoticeIsSuccess
                  ? "text-green-800 hover:bg-green-100/80"
                  : "text-amber-900 hover:bg-amber-100/80"
              }`}
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={bannerShellClass} aria-hidden={!bannerSrc}>
          {bannerSrc ? (
            <CategoryBannerImage
              src={bannerSrc}
              alt={`${category.name} — banner`}
              categorySlug={category.slug}
            />
          ) : null}
        </div>

        <div className="mt-8 sm:mt-10">
          <p className="text-sm font-medium text-ambuhub-brand">Services</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-foreground/70 sm:mt-4 sm:text-lg">
            {description}
          </p>
          {!sessionLoading && !user ? (
            <div className="mt-5 rounded-2xl border border-ambuhub-200 bg-ambuhub-50 px-4 py-3 text-sm leading-relaxed text-foreground/90 sm:mt-6 sm:px-5 sm:py-4">
              <p className="font-semibold text-foreground">Purchasing sale listings</p>
              <p className="mt-1.5">
                You need to{" "}
                <Link href={loginHref} className="font-semibold text-ambuhub-brand underline">
                  log in
                </Link>{" "}
                before &quot;Add to cart&quot; will work. Both{" "}
                <strong>client</strong> and <strong>service provider</strong> accounts can
                buy sale items—the cart and badge only appear after you are signed in.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={`mx-auto mt-10 w-full max-w-7xl flex-1 px-4 sm:mt-12 sm:px-6 lg:mt-14 lg:px-8 ${listingBottomPad}`}
      >
        <div className="mb-6 overflow-x-auto rounded-2xl border border-ambuhub-100 bg-white/95 p-2 shadow-sm sm:mb-8">
          <div className="flex min-w-max items-center gap-2">
            {AMBUHUB_SERVICES.map((svc) => {
              const active = svc.slug === category.slug;
              return (
                <Link
                  key={svc.slug}
                  href={`/services/${encodeURIComponent(svc.slug)}`}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-ambuhub-brand text-white"
                      : "bg-ambuhub-50 text-foreground hover:bg-ambuhub-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {svc.title}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ambuhub-100 bg-gradient-to-br from-ambuhub-600 to-ambuhub-800 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Search & filters</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-white/85 underline decoration-white/30 underline-offset-4 hover:text-white"
                  onClick={() => {
                    setSearchQuery("");
                    setDepartmentFilter("all");
                    setListingTypeFilter("all");
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="services-smart-search"
                    className="block text-sm font-medium text-white"
                  >
                    Search listings
                  </label>
                  <div className="relative mt-1.5">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45"
                      aria-hidden
                    />
                    <input
                      id="services-smart-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, description, price..."
                      className="w-full rounded-xl border border-ambuhub-200 bg-white py-3 pl-9 pr-4 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="department-filter"
                    className="block text-sm font-medium text-white"
                  >
                    Department
                  </label>
                  <select
                    id="department-filter"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
                  >
                    <option value="all">All departments</option>
                    {departmentOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="listing-type-filter"
                    className="block text-sm font-medium text-white"
                  >
                    Listing type
                  </label>
                  <select
                    id="listing-type-filter"
                    value={listingTypeFilter}
                    onChange={(e) =>
                      setListingTypeFilter(e.target.value as ListingTypeFilter)
                    }
                    className="mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25"
                  >
                    <option value="all">All types</option>
                    <option value="sale">Sale</option>
                    <option value="hire">Hire</option>
                    <option value="book">Book</option>
                    <option value="none">Not specified</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">

        {itemCount > 0 ? (
          <div className="mb-6 hidden items-center justify-between gap-4 rounded-2xl border border-ambuhub-200 bg-white px-5 py-4 shadow-sm sm:flex">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Your cart</p>
              <p className="mt-0.5 text-sm text-foreground/70">
                {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                {formatNaira(subtotalNgn)}
              </p>
            </div>
            <Link
              href="/checkout"
              className="shrink-0 rounded-xl bg-ambuhub-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark"
            >
              Checkout
            </Link>
          </div>
        ) : null}

        {filteredSections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ambuhub-200 bg-ambuhub-surface/50 px-6 py-12 text-center text-foreground/60">
            No listings match the selected filters.
          </p>
        ) : (
          <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14">
            {filteredSections.map((section, sectionIndex) => (
              <section
                key={section.key}
                aria-labelledby={`dept-heading-${section.key}`}
                className="min-w-0"
              >
                {sectionIndex > 0 ? (
                  <div
                    className="mb-8 h-px w-full bg-ambuhub-200/90 sm:mb-10"
                    aria-hidden
                  />
                ) : null}
                <h2
                  id={`dept-heading-${section.key}`}
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  {section.heading}
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-5 min-w-0 sm:grid-cols-2 sm:gap-5 lg:mt-6 lg:grid-cols-4 lg:gap-6">
                  {section.services.map((svc) => (
                    <li key={svc.id} className="min-w-0">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ambuhub-100 bg-white shadow-sm">
                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ambuhub-100">
                          <ServiceCardImage
                            photoUrl={svc.photoUrls[0]}
                            alt={svc.title}
                          />
                          <span className="absolute bottom-3 left-3 rounded-md bg-black/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                            {formatListingTypeLabel(svc.listingType)}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <h3 className="text-base font-semibold text-foreground">
                            {svc.title}
                          </h3>
                          {svc.listingType === "sale" &&
                          typeof svc.price === "number" ? (
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {formatNaira(svc.price)}
                            </p>
                          ) : null}
                          {svc.listingType === "hire" &&
                          typeof svc.price === "number" ? (
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {formatNaira(svc.price)}
                              {svc.pricingPeriod ? (
                                <span className="font-medium text-foreground/80">
                                  {" "}
                                  ({formatHirePricePeriodSuffix(svc.pricingPeriod)})
                                </span>
                              ) : null}
                            </p>
                          ) : null}
                          {svc.listingType === "hire" &&
                          svc.pricingPeriod &&
                          typeof svc.price !== "number" ? (
                            <p className="mt-2 text-xs font-medium text-foreground/70">
                              Period: {formatPricingPeriodLabel(svc.pricingPeriod)}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs font-medium text-foreground/70">
                            {formatStockLabel(svc.listingType, svc.stock)}
                          </p>
                          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">
                            {svc.description}
                          </p>
                          {isSalePurchasable(svc) ? (
                            <div className="mt-4 border-t border-ambuhub-100 pt-4">
                              {cart.items.some((i) => i.serviceId === svc.id) ? (
                                <p className="text-xs font-semibold text-ambuhub-brand">
                                  In cart:{" "}
                                  {cart.items.find((i) => i.serviceId === svc.id)
                                    ?.quantity ?? 0}
                                </p>
                              ) : null}
                              {sessionLoading ? (
                                <p className="text-xs text-foreground/55">Checking session…</p>
                              ) : user ? (
                                <button
                                  type="button"
                                  onClick={() => void handleAddToCart(svc.id)}
                                  disabled={addingServiceId === svc.id}
                                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {addingServiceId === svc.id ? (
                                    <Loader2
                                      className="h-4 w-4 shrink-0 animate-spin"
                                      aria-hidden
                                    />
                                  ) : (
                                    <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
                                  )}
                                  Add to cart
                                </button>
                              ) : (
                                <Link
                                  href={loginHref}
                                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-ambuhub-brand bg-white px-4 py-2.5 text-sm font-semibold text-ambuhub-brand transition-colors hover:bg-ambuhub-50"
                                >
                                  Log in to purchase
                                </Link>
                              )}
                            </div>
                          ) : null}
                          {svc.listingType === "hire" ? (
                            <div className="mt-4 border-t border-ambuhub-100 pt-4">
                              {isHireBookable(svc) ? (
                                sessionLoading ? (
                                  <p className="mt-2 text-xs text-foreground/55">Checking session…</p>
                                ) : user ? (
                                  <Link
                                    href={`/hire/${svc.id}`}
                                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark"
                                  >
                                    Hire now
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/auth?next=${encodeURIComponent(`/hire/${svc.id}`)}`}
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-ambuhub-brand bg-white px-4 py-2.5 text-sm font-semibold text-ambuhub-brand transition-colors hover:bg-ambuhub-50"
                                  >
                                    Log in to hire
                                  </Link>
                                )
                              ) : (
                                <p className="mt-2 text-xs text-foreground/55">
                                  This hire listing is not available.
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
          </div>
        </div>

        <Link
          href="/#services"
          className="mt-10 inline-flex text-sm font-semibold text-ambuhub-brand hover:underline sm:mt-12"
        >
          &larr; Back to services
        </Link>
      </div>

      {itemCount > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ambuhub-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md sm:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/70">Cart</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                {formatNaira(subtotalNgn)}
              </p>
            </div>
            <Link
              href="/checkout"
              className="shrink-0 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              Checkout
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
