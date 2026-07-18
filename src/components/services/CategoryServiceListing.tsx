"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Loader2, Search, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { API_PROXY_PREFIX } from "@/lib/api";
import {
  writeBrowseCountryCookie,
  type MarketplaceBrowseCountry,
} from "@/lib/browse-country";
import { getCountryNameByCode } from "@/lib/countries";
import { FALLBACK_THUMB, isCloudinaryHost } from "@/lib/landing-service-categories";
import { AMBUHUB_SERVICES } from "@/lib/ambuhub-services";
import { postCartItem } from "@/lib/marketplace-cart";
import {
  addFavoriteService,
  fetchMyFavoriteServices,
  removeFavoriteService,
} from "@/lib/service-favorites";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import { AMBUHUB_MARKETPLACE_INVALIDATE_EVENT } from "@/lib/cache-tags";
import { isBookBookable } from "@/lib/book-bookable";
import { hasValidHireReturnWindow } from "@/lib/hire-return-window";
import {
  getCategoryPageTitleDescription,
  groupMarketplaceByDepartments,
  type DepartmentServiceSection,
  type MarketplaceServiceRow,
  type ServiceCategoryPageDto,
} from "@/lib/service-category-page-data";
import {
  formatStockLabel,
  getListingCurrency,
  getListingPrice,
  isSalePurchasable,
  saleUnavailableReason,
} from "@/lib/marketplace-listing";
import {
  formatMoney,
  getCurrencySymbol,
  parseSupportedCurrency,
  type SupportedCurrency,
} from "@/lib/currency";

const BANNER_SIZES = "100vw";
const CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

const filterLabelClass = "block text-xs font-medium text-white";
const filterControlClass =
  "w-full rounded-lg border border-ambuhub-200 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 disabled:cursor-not-allowed disabled:opacity-60";
const filterControlDisabledClass = `${filterControlClass} disabled:cursor-not-allowed disabled:opacity-60`;

const MARKETPLACE_COUNTRY_OPTIONS: {
  code: MarketplaceBrowseCountry;
  label: string;
}[] = [
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
];

const bannerImgBase = "h-full w-full object-cover";

type ListingTypeFilter = "all" | "sale" | "hire" | "book" | "none";

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Parse filter input: digits with optional commas/decimals. */
function parsePriceFilterInput(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) {
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

function serviceListingDisplayPrice(
  service: MarketplaceServiceRow,
): number | null {
  return getListingPrice(service);
}

function stateFilterOptionValue(option: {
  code: string;
  countryCode: string;
}): string {
  if (option.countryCode) {
    return `${option.countryCode}|${option.code}`;
  }
  return option.code;
}

function parseStateFilterValue(value: string): {
  countryCode: string;
  stateCode: string;
} {
  const pipe = value.indexOf("|");
  if (pipe === -1) {
    return { countryCode: "", stateCode: value };
  }
  return {
    countryCode: value.slice(0, pipe),
    stateCode: value.slice(pipe + 1),
  };
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

export function ServiceCardImage({
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
  initialCountry: MarketplaceBrowseCountry;
  /** True when the user previously chose a country (cookie set). */
  hasCountryCookie: boolean;
};

function sectionsCacheKey(
  categorySlug: string,
  country: MarketplaceBrowseCountry,
): string {
  return `${categorySlug}|${country}`;
}

export function CategoryServiceListing({
  category,
  sections,
  initialCountry,
  hasCountryCookie,
}: Props) {
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
    subtotal,
    currency: cartCurrencyFromSession,
  } = useSessionAndCart();
  const [detectedCountry, setDetectedCountry] =
    useState<MarketplaceBrowseCountry>(initialCountry);
  const [browseCountry, setBrowseCountry] =
    useState<MarketplaceBrowseCountry>(initialCountry);
  const [countryReady, setCountryReady] = useState(false);
  const [liveSections, setLiveSections] = useState(sections);
  const lastFetchedKeyRef = useRef(
    sectionsCacheKey(category.slug, initialCountry),
  );
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [favoritesLoadState, setFavoritesLoadState] = useState<
    "idle" | "loading" | "ready"
  >("idle");
  const [favoriteTogglingId, setFavoriteTogglingId] = useState<string | null>(
    null,
  );
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [listingTypeFilter, setListingTypeFilter] =
    useState<ListingTypeFilter>("all");

  useEffect(() => {
    setBrowseCountry(initialCountry);
    setLiveSections(sections);
    lastFetchedKeyRef.current = sectionsCacheKey(category.slug, initialCountry);
  }, [category.slug, initialCountry, sections]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_PROXY_PREFIX}/marketplace/country`, {
          cache: "no-store",
          credentials: "omit",
        });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { countryCode?: string };
        const code = data.countryCode?.trim().toUpperCase();
        if (!cancelled && (code === "NG" || code === "GH")) {
          setDetectedCountry(code);
          // Never override an explicit user country choice from the cookie.
          if (!hasCountryCookie) {
            setBrowseCountry(code);
          }
        }
      } catch {
        /* keep initialCountry */
      } finally {
        if (!cancelled) {
          setCountryReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasCountryCookie]);

  const refetchMarketplaceSections = useCallback(async () => {
    const fetchKey = sectionsCacheKey(category.slug, browseCountry);
    try {
      const res = await fetch(
        `${API_PROXY_PREFIX}/services/marketplace?categorySlug=${encodeURIComponent(category.slug)}&countryCode=${encodeURIComponent(browseCountry)}`,
        {
          cache: "no-store",
          credentials: "omit",
        },
      );
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { services?: MarketplaceServiceRow[] };
      const rows = Array.isArray(data.services) ? data.services : [];
      setLiveSections(groupMarketplaceByDepartments(category, rows));
      lastFetchedKeyRef.current = fetchKey;
    } catch {
      /* keep current liveSections */
    }
  }, [category, browseCountry]);

  useEffect(() => {
    if (!countryReady) {
      return;
    }
    const key = sectionsCacheKey(category.slug, browseCountry);
    if (lastFetchedKeyRef.current === key) {
      return;
    }
    void refetchMarketplaceSections();
  }, [category.slug, countryReady, browseCountry, refetchMarketplaceSections]);

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
    const isSuccess =
      cartNotice.startsWith("Added") ||
      cartNotice.startsWith("Saved") ||
      cartNotice.startsWith("Removed");
    const ms = isSuccess ? 3500 : 9000;
    const id = window.setTimeout(() => setCartNotice(null), ms);
    return () => window.clearTimeout(id);
  }, [cartNotice]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [stateFilter, setStateFilter] = useState<Set<string>>(() => new Set());
  const [stateFilterOpen, setStateFilterOpen] = useState(false);

  const listingCurrency = parseSupportedCurrency(
    browseCountry === "GH" ? "GHS" : "NGN",
  );
  const cartCurrency = parseSupportedCurrency(
    cartCurrencyFromSession ?? (browseCountry === "GH" ? "GHS" : "NGN"),
  );

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

  const priceBounds = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const section of liveSections) {
      for (const service of section.services) {
        const price = serviceListingDisplayPrice(service);
        if (price === null) {
          continue;
        }
        min = Math.min(min, price);
        max = Math.max(max, price);
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0, hasPrices: false };
    }
    return { min, max, hasPrices: true };
  }, [liveSections]);

  const parsedPriceMin = useMemo(
    () => parsePriceFilterInput(priceMinInput),
    [priceMinInput],
  );
  const parsedPriceMax = useMemo(
    () => parsePriceFilterInput(priceMaxInput),
    [priceMaxInput],
  );

  const priceFilterActive =
    parsedPriceMin !== null || parsedPriceMax !== null;

  const locationOptions = useMemo(() => {
    const statesByKey = new Map<
      string,
      { code: string; label: string; countryCode: string }
    >();

    for (const section of liveSections) {
      for (const service of section.services) {
        const countryCode = service.countryCode?.trim().toLowerCase() ?? "";

        const stateCode = service.stateProvince?.trim() ?? "";
        if (!stateCode) {
          continue;
        }
        const label =
          service.stateProvinceName?.trim() || stateCode;
        const key = countryCode
          ? `${countryCode}|${stateCode}`
          : `|${stateCode}`;
        statesByKey.set(key, {
          code: stateCode,
          label,
          countryCode,
        });
      }
    }

    const stateList = Array.from(statesByKey.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    return {
      states: stateList,
      hasStates: stateList.length > 0,
    };
  }, [liveSections]);

  const browseCountryLower = browseCountry.toLowerCase();

  const stateFilterOptions = useMemo(() => {
    return locationOptions.states.filter(
      (s) => !s.countryCode || s.countryCode === browseCountryLower,
    );
  }, [browseCountryLower, locationOptions.states]);

  const locationFilterActive = stateFilter.size > 0;

  const selectedStateCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const value of stateFilter) {
      const { stateCode } = parseStateFilterValue(value);
      if (stateCode) {
        codes.add(stateCode);
      }
    }
    return codes;
  }, [stateFilter]);

  function toggleStateFilter(value: string) {
    setStateFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  const filteredSections = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    const effectiveMin = parsedPriceMin;
    let effectiveMax = parsedPriceMax;
    if (
      effectiveMin !== null &&
      effectiveMax !== null &&
      effectiveMin > effectiveMax
    ) {
      effectiveMax = effectiveMin;
    }

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
        service.countryCode ?? "",
        service.countryCode
          ? getCountryNameByCode(service.countryCode) ?? ""
          : "",
        service.stateProvince ?? "",
        service.stateProvinceName ?? "",
      ];

      const haystack = normalizeSearchText(searchableParts.join(" "));
      return haystack.includes(normalizedQuery);
    }

    function matchesLocation(service: MarketplaceServiceRow): boolean {
      if (!locationFilterActive) {
        return true;
      }

      const svcState = service.stateProvince?.trim() ?? "";
      if (!svcState) {
        return false;
      }
      return selectedStateCodes.has(svcState);
    }

    function matchesPriceRange(service: MarketplaceServiceRow): boolean {
      if (!priceFilterActive) {
        return true;
      }
      const price = serviceListingDisplayPrice(service);
      if (price === null) {
        return false;
      }
      if (effectiveMin !== null && price < effectiveMin) {
        return false;
      }
      if (effectiveMax !== null && price > effectiveMax) {
        return false;
      }
      return true;
    }

    return liveSections
      .map((section) => {
        if (departmentFilter !== "all" && section.key !== departmentFilter) {
          return null;
        }

        const services = section.services.filter(
          (service) =>
            matchesListingType(service) &&
            matchesSearch(service, section) &&
            matchesLocation(service) &&
            matchesPriceRange(service),
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
  }, [
    departmentFilter,
    listingTypeFilter,
    searchQuery,
    liveSections,
    priceFilterActive,
    parsedPriceMin,
    parsedPriceMax,
    locationFilterActive,
    selectedStateCodes,
  ]);

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

  async function handleToggleFavorite(serviceId: string) {
    if (!user || favoritesLoadState !== "ready") {
      return;
    }
    setFavoriteTogglingId(serviceId);
    setCartNotice(null);
    try {
      const isFav = favoriteIds.has(serviceId);
      const rows = isFav
        ? await removeFavoriteService(serviceId)
        : await addFavoriteService(serviceId);
      setFavoriteIds(new Set(rows.map((r) => r.id)));
      setCartNotice(
        isFav ? "Removed from favorites." : "Saved to favorites.",
      );
    } catch (err) {
      setCartNotice(
        err instanceof Error ? err.message : "Could not update favorites.",
      );
    } finally {
      setFavoriteTogglingId(null);
    }
  }

  const listingBottomPad =
    itemCount > 0 ? "pb-28 sm:pb-20" : "pb-14 sm:pb-16 lg:pb-20";

  const cartNoticeIsSuccess = Boolean(
    cartNotice &&
      (cartNotice.startsWith("Added") ||
        cartNotice.startsWith("Saved") ||
        cartNotice.startsWith("Removed")),
  );

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
              <p className="font-semibold text-foreground">Purchasing & saving listings</p>
              <p className="mt-1.5">
                You need to{" "}
                <Link href={loginHref} className="font-semibold text-ambuhub-brand underline">
                  log in
                </Link>{" "}
                before &quot;Add to cart&quot; or the heart (save to favorites) will work. Both{" "}
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
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:self-start">
            <div className="rounded-2xl border border-ambuhub-100 bg-gradient-to-br from-ambuhub-600 to-ambuhub-800 p-4 shadow-sm lg:max-h-[inherit] lg:overflow-y-auto">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Search & filters</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-white/85 underline decoration-white/30 underline-offset-4 hover:text-white"
                  onClick={() => {
                    setSearchQuery("");
                    setDepartmentFilter("all");
                    setListingTypeFilter("all");
                    setPriceMinInput("");
                    setPriceMaxInput("");
                    writeBrowseCountryCookie(null);
                    setBrowseCountry(detectedCountry);
                    setStateFilter(new Set());
                    setStateFilterOpen(false);
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <div>
                  <label htmlFor="services-smart-search" className={filterLabelClass}>
                    Search listings
                  </label>
                  <div className="relative mt-1">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/45"
                      aria-hidden
                    />
                    <input
                      id="services-smart-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, description, price..."
                      className={`${filterControlClass} py-2 pl-8 pr-3`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="department-filter" className={filterLabelClass}>
                    Department
                  </label>
                  <select
                    id="department-filter"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className={`mt-1 ${filterControlClass}`}
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
                  <label htmlFor="listing-type-filter" className={filterLabelClass}>
                    Listing type
                  </label>
                  <select
                    id="listing-type-filter"
                    value={listingTypeFilter}
                    onChange={(e) =>
                      setListingTypeFilter(e.target.value as ListingTypeFilter)
                    }
                    className={`mt-1 ${filterControlClass}`}
                  >
                    <option value="all">All types</option>
                    <option value="sale">Sale</option>
                    <option value="hire">Hire</option>
                    <option value="book">Book</option>
                    <option value="none">Not specified</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="country-filter" className={filterLabelClass}>
                    Country
                  </label>
                  <select
                    id="country-filter"
                    value={browseCountry}
                    onChange={(e) => {
                      const next = e.target.value.trim().toUpperCase();
                      if (next === "NG" || next === "GH") {
                        writeBrowseCountryCookie(next);
                        setBrowseCountry(next);
                        setStateFilter(new Set());
                        setStateFilterOpen(false);
                      }
                    }}
                    className={`mt-1 ${filterControlClass}`}
                  >
                    {MARKETPLACE_COUNTRY_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {browseCountry !== detectedCountry ? (
                    <p className="mt-1 text-xs text-white/75">
                      Showing {getCountryNameByCode(browseCountry) ?? browseCountry}{" "}
                      listings (your location:{" "}
                      {getCountryNameByCode(detectedCountry) ?? detectedCountry}).
                    </p>
                  ) : null}
                </div>

                <div>
                  <button
                    type="button"
                    id="state-filter-toggle"
                    aria-expanded={stateFilterOpen}
                    aria-controls="state-filter-panel"
                    disabled={
                      !locationOptions.hasStates || stateFilterOptions.length === 0
                    }
                    onClick={() => setStateFilterOpen((open) => !open)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="min-w-0">
                      <span className={filterLabelClass}>State / province</span>
                      <span className="mt-0.5 block truncate text-xs text-white/75">
                        {stateFilter.size > 0
                          ? `${stateFilter.size} selected`
                          : stateFilterOptions.length > 0
                            ? "All states / provinces"
                            : "Unavailable"}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/80 transition-transform ${
                        stateFilterOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {stateFilterOpen && stateFilterOptions.length > 0 ? (
                    <div
                      id="state-filter-panel"
                      role="group"
                      aria-labelledby="state-filter-toggle"
                      className="mt-1.5 max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-white/20 bg-white/10 p-2"
                    >
                      {stateFilterOptions.map((option) => {
                        const value = stateFilterOptionValue(option);
                        const inputId = `state-filter-${value.replace(/\|/g, "-")}`;
                        return (
                          <label
                            key={value}
                            htmlFor={inputId}
                            className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-sm text-white hover:bg-white/10"
                          >
                            <input
                              id={inputId}
                              type="checkbox"
                              checked={stateFilter.has(value)}
                              onChange={() => toggleStateFilter(value)}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 bg-white/90 text-ambuhub-brand focus:ring-2 focus:ring-white/50"
                            />
                            <span className="leading-snug">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                  {stateFilter.size > 0 && !stateFilterOpen ? (
                    <p className="mt-1 text-xs text-white/75">
                      Expand to change selection.
                    </p>
                  ) : null}
                  {!locationOptions.hasStates ? (
                    <p className="mt-1 text-xs text-white/75">
                      No state or province set on listings in this category.
                    </p>
                  ) : stateFilterOptions.length === 0 ? (
                    <p className="mt-1 text-xs text-white/75">
                      No states listed for this country in this category.
                    </p>
                  ) : null}
                </div>

                <fieldset className="min-w-0">
                  <legend className={filterLabelClass}>
                    Price range ({getCurrencySymbol(listingCurrency)})
                  </legend>
                  {priceBounds.hasPrices ? (
                    <p className="mt-0.5 text-[11px] leading-snug text-white/75">
                      {formatMoney(priceBounds.min, listingCurrency)} –{" "}
                      {formatMoney(priceBounds.max, listingCurrency)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] leading-snug text-white/75">
                      No priced listings in this category yet.
                    </p>
                  )}
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    <div className="min-w-0">
                      <label
                        htmlFor="price-min-filter"
                        className="sr-only"
                      >
                        Minimum price
                      </label>
                      <input
                        id="price-min-filter"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={priceMinInput}
                        onChange={(e) => setPriceMinInput(e.target.value)}
                        placeholder="Min"
                        disabled={!priceBounds.hasPrices}
                        className={`${filterControlDisabledClass} placeholder:text-foreground/45`}
                      />
                    </div>
                    <div className="min-w-0">
                      <label
                        htmlFor="price-max-filter"
                        className="sr-only"
                      >
                        Maximum price
                      </label>
                      <input
                        id="price-max-filter"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={priceMaxInput}
                        onChange={(e) => setPriceMaxInput(e.target.value)}
                        placeholder="Max"
                        disabled={!priceBounds.hasPrices}
                        className={`${filterControlDisabledClass} placeholder:text-foreground/45`}
                      />
                    </div>
                  </div>
                  {parsedPriceMin !== null &&
                  parsedPriceMax !== null &&
                  parsedPriceMin > parsedPriceMax ? (
                    <p className="mt-1.5 text-xs text-amber-200">
                      Min is above max — showing listings at or above min only.
                    </p>
                  ) : null}
                </fieldset>
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
                {formatMoney(subtotal, cartCurrency)}
              </p>
            </div>
            <Link
              href={`/checkout?category=${encodeURIComponent(category.slug)}`}
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
                  {section.services.map((svc) => {
                    const listingDetailHref = `/services/${encodeURIComponent(category.slug)}/${encodeURIComponent(svc.id)}?countryCode=${encodeURIComponent(browseCountry)}`;
                    return (
                    <li key={svc.id} className="min-w-0">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ambuhub-100 bg-white shadow-sm">
                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-ambuhub-100">
                          <Link
                            href={listingDetailHref}
                            className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-ambuhub-brand focus-visible:ring-offset-2"
                          >
                            <span className="sr-only">
                              View full details: {svc.title}
                            </span>
                            <ServiceCardImage
                              photoUrl={svc.photoUrls[0]}
                              alt={svc.title}
                            />
                          </Link>
                          <span className="pointer-events-none absolute bottom-3 left-3 z-[1] rounded-md bg-black/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                            {formatListingTypeLabel(svc.listingType)}
                          </span>
                          <div className="absolute right-3 top-3 z-10">
                            {sessionLoading ? null : user ? (
                              <button
                                type="button"
                                disabled={
                                  favoritesLoadState !== "ready" ||
                                  favoriteTogglingId === svc.id
                                }
                                onClick={() => void handleToggleFavorite(svc.id)}
                                className="rounded-full bg-black/45 p-2 backdrop-blur-sm transition-opacity hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={
                                  favoriteIds.has(svc.id)
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                {favoriteTogglingId === svc.id ? (
                                  <Loader2
                                    className="h-5 w-5 animate-spin text-white"
                                    aria-hidden
                                  />
                                ) : (
                                  <Heart
                                    className={`h-5 w-5 ${
                                      favoriteIds.has(svc.id)
                                        ? "fill-red-500 text-red-500"
                                        : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                                    }`}
                                    aria-hidden
                                  />
                                )}
                              </button>
                            ) : (
                              <Link
                                href={loginHref}
                                className="block rounded-full bg-black/45 p-2 backdrop-blur-sm transition-opacity hover:bg-black/55"
                                aria-label="Sign in to save favorites"
                              >
                                <Heart
                                  className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                                  aria-hidden
                                />
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={listingDetailHref}
                            className="group flex min-h-0 flex-1 flex-col px-5 pt-5 sm:px-6 sm:pt-6"
                          >
                            <h3 className="text-base font-semibold text-foreground group-hover:underline">
                              {svc.title}
                            </h3>
                            {svc.listingType === "sale" &&
                            getListingPrice(svc) != null ? (
                              <p className="mt-2 text-sm font-semibold text-foreground">
                                {formatMoney(
                                  getListingPrice(svc)!,
                                  getListingCurrency(svc),
                                )}
                              </p>
                            ) : null}
                            {svc.listingType === "hire" &&
                            getListingPrice(svc) != null ? (
                              <p className="mt-2 text-sm font-semibold text-foreground">
                                {formatMoney(
                                  getListingPrice(svc)!,
                                  getListingCurrency(svc),
                                )}
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
                          </Link>
                          {isSalePurchasable(svc) ? (
                            <div className="mt-4 border-t border-ambuhub-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
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
                          ) : svc.listingType === "sale" ? (
                            <div className="mt-4 border-t border-ambuhub-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                              <p className="text-xs text-foreground/55">
                                {saleUnavailableReason(svc) ??
                                  "This listing is not available for purchase."}
                              </p>
                            </div>
                          ) : null}
                          {svc.listingType === "book" ? (
                            <div className="mt-4 border-t border-ambuhub-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                              {isBookBookable(svc) ? (
                                sessionLoading ? (
                                  <p className="mt-2 text-xs text-foreground/55">Checking session…</p>
                                ) : user ? (
                                  <Link
                                    href={`/book/${svc.id}`}
                                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ambuhub-brand-dark"
                                  >
                                    Book now
                                  </Link>
                                ) : (
                                  <Link
                                    href={`/auth?next=${encodeURIComponent(`/book/${svc.id}`)}`}
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-ambuhub-brand bg-white px-4 py-2.5 text-sm font-semibold text-ambuhub-brand transition-colors hover:bg-ambuhub-50"
                                  >
                                    Log in to book
                                  </Link>
                                )
                              ) : (
                                <p className="mt-2 text-xs text-foreground/55">
                                  This listing is not available for booking.
                                </p>
                              )}
                            </div>
                          ) : null}
                          {svc.listingType === "hire" ? (
                            <div className="mt-4 border-t border-ambuhub-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
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
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
          </div>
        </div>

        <Link
          href="/services"
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
                {formatMoney(subtotal, cartCurrency)}
              </p>
            </div>
            <Link
              href={`/checkout?category=${encodeURIComponent(category.slug)}`}
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
