import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { getCountryNameByCode } from "@/lib/countries";
import {
  formatHireReturnWindowSummary,
  hasValidHireReturnWindow,
} from "@/lib/hire-return-window";
import { FALLBACK_THUMB, isCloudinaryHost } from "@/lib/landing-service-categories";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";

const nairaFmt = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });

const neonCard =
  "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/50 to-cyan-100/35 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35),0_0_1px_rgba(0,105,180,0.12)] ring-1 ring-cyan-200/40";

const neonCardMuted =
  "relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-white/90 shadow-[0_0_24px_-8px_rgba(34,211,238,0.22)] ring-1 ring-sky-100/60";

const neonTopBar =
  "pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]";

function formatNaira(value: number): string {
  return `₦${nairaFmt.format(value)}`;
}

function formatListingTypeLabel(
  listingType: "sale" | "hire" | "book" | null,
): string {
  if (listingType === "sale") return "Sale";
  if (listingType === "hire") return "Hire";
  if (listingType === "book") return "Book";
  return "Not specified";
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
    return `${stock} in stock`;
  }
  return "Stock not specified";
}

const HERO_SIZES = "(max-width: 768px) 100vw, 896px";
const GRID_SIZES = "(max-width: 640px) 50vw, 280px";

function GalleryImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const trimmed = src.trim();
  if (!trimmed) {
    return (
      <Image
        src={FALLBACK_THUMB}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority={priority}
      />
    );
  }
  if (trimmed.startsWith("/")) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority={priority}
      />
    );
  }
  if (trimmed.startsWith("http") && isCloudinaryHost(trimmed)) {
    return (
      <Image
        src={trimmed}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes={sizes}
        priority={priority}
      />
    );
  }
  if (trimmed.startsWith("http")) {
    return (
      <img
        src={trimmed}
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
      sizes={sizes}
      priority={priority}
    />
  );
}

function NeonOrbs() {
  return (
    <>
      <div
        className="pointer-events-none absolute -right-14 -top-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-sky-400/15 blur-2xl"
        aria-hidden
      />
    </>
  );
}

function ListingPhotoGallery({ service }: { service: MarketplaceServiceRow }) {
  const photos =
    Array.isArray(service.photoUrls) && service.photoUrls.length > 0
      ? service.photoUrls.map((u) => String(u).trim()).filter(Boolean)
      : [];

  const frameClass =
    "relative overflow-hidden rounded-2xl border-2 border-cyan-400/50 bg-slate-900/5 shadow-[0_0_40px_-6px_rgba(34,211,238,0.45),inset_0_0_0_1px_rgba(255,255,255,0.4)] ring-2 ring-cyan-200/30";

  if (photos.length === 0) {
    return (
      <div className={`aspect-[16/10] w-full ${frameClass}`}>
        <GalleryImage src="" alt={service.title} sizes={HERO_SIZES} priority />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#004a7c]/25 via-transparent to-cyan-400/10" />
      </div>
    );
  }

  const [first, ...rest] = photos;

  return (
    <div className="space-y-4">
      <div className={`aspect-[16/10] w-full ${frameClass}`}>
        <GalleryImage
          src={first ?? ""}
          alt={`${service.title} — photo 1`}
          sizes={HERO_SIZES}
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#004a7c]/30 via-transparent to-cyan-300/10" />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {rest.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-cyan-300/50 bg-slate-100 shadow-[0_0_20px_-6px_rgba(34,211,238,0.3)] ring-1 ring-white/80 transition hover:border-cyan-400/70 hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.4)]"
            >
              <GalleryImage
                src={url}
                alt={`${service.title} — photo ${i + 2}`}
                sizes={GRID_SIZES}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  service: MarketplaceServiceRow;
  backHref: string;
  backLabel: string;
  variant: "public" | "client";
  /** Sticky sidebar: cart, hire, favorites (public layout). */
  actions?: ReactNode;
  /** Full-width below grid: reviews, write-review prompt. */
  children?: ReactNode;
};

export function MarketplaceListingDetail({
  service,
  backHref,
  backLabel,
  variant,
  actions,
  children,
}: Props) {
  const isPublic = variant === "public";

  const countryName =
    service.countryCode && service.countryCode.length === 2
      ? getCountryNameByCode(service.countryCode)
      : null;
  const hasLocation =
    Boolean(service.countryCode) ||
    Boolean(service.stateProvinceName || service.stateProvince) ||
    Boolean(service.officeAddress?.trim());

  const returnSummary =
    service.listingType === "hire" && hasValidHireReturnWindow(service.hireReturnWindow)
      ? formatHireReturnWindowSummary(service.hireReturnWindow)
      : null;

  const shellClass = isPublic
    ? "mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8"
    : "mx-auto w-full max-w-4xl";

  const backClass = isPublic
    ? "group inline-flex items-center gap-2 rounded-xl border border-cyan-400/45 bg-white/90 px-3 py-2 text-sm font-semibold text-[#004a7c] shadow-[0_0_20px_-6px_rgba(34,211,238,0.25)] ring-1 ring-cyan-100/50 transition hover:border-cyan-300 hover:bg-cyan-50/80 hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.35)]"
    : "inline-flex text-sm font-semibold text-ambuhub-brand underline-offset-4 hover:underline";

  const infoCardClass = isPublic ? neonCard : "";
  const descCardClass = isPublic ? neonCardMuted : "";

  return (
    <div className={shellClass}>
      <Link href={backHref} className={backClass}>
        {isPublic ? (
          <ArrowLeft
            className="h-4 w-4 transition group-hover:-translate-x-0.5"
            aria-hidden
          />
        ) : null}
        {isPublic ? backLabel : `← ${backLabel}`}
      </Link>

      {isPublic ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/55 bg-gradient-to-r from-cyan-50 to-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0c4a6e] shadow-[0_0_18px_rgba(34,211,238,0.35)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" aria-hidden />
            Listing details
          </span>
          <span className="text-xs font-medium text-slate-500">
            {service.category.name} · {service.departmentName}
          </span>
        </div>
      ) : null}

      <div className="mt-6">
        <ListingPhotoGallery service={service} />
      </div>

      <div
        className={
          isPublic
            ? "mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start"
            : "mt-8 space-y-6"
        }
      >
        <div className="min-w-0 space-y-6">
          <article className={`${infoCardClass} p-5 sm:p-6`}>
            {isPublic ? (
              <>
                <NeonOrbs />
                <div className={neonTopBar} />
              </>
            ) : null}
            <div className={isPublic ? "relative" : undefined}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    isPublic
                      ? "rounded-full border border-cyan-300/60 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0369a1]"
                      : "rounded-full bg-ambuhub-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ambuhub-brand"
                  }
                >
                  {formatListingTypeLabel(service.listingType)}
                </span>
                {service.isAvailable === false ? (
                  <span className="rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                    Unavailable
                  </span>
                ) : null}
              </div>

              <h1
                className={
                  isPublic
                    ? "mt-4 bg-gradient-to-r from-[#004a7c] via-[#0069b4] to-cyan-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl lg:text-4xl"
                    : "mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                }
              >
                {service.title}
              </h1>

              {!isPublic ? (
                <p className="mt-2 text-sm text-foreground/70">
                  {service.category.name} · {service.departmentName}
                </p>
              ) : null}

              {!isPublic &&
              service.listingType === "sale" &&
              typeof service.price === "number" ? (
                <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  {formatNaira(service.price)}
                </p>
              ) : null}
              {!isPublic &&
              service.listingType === "hire" &&
              typeof service.price === "number" ? (
                <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  {formatNaira(service.price)}
                  {service.pricingPeriod && isPricingPeriod(service.pricingPeriod) ? (
                    <span className="text-base font-semibold text-foreground/75">
                      {" "}
                      ({formatHirePricePeriodSuffix(service.pricingPeriod)})
                    </span>
                  ) : null}
                </p>
              ) : null}

              {isPublic ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(service.listingType === "sale" || service.listingType === "hire") &&
                  typeof service.price === "number" ? (
                    <span className="inline-flex rounded-xl border border-cyan-200/70 bg-white/90 px-3 py-1.5 text-sm font-bold text-[#004a7c] shadow-sm ring-1 ring-cyan-100/50">
                      {formatNaira(service.price)}
                      {service.listingType === "hire" &&
                      service.pricingPeriod &&
                      isPricingPeriod(service.pricingPeriod) ? (
                        <span className="ml-1 font-semibold text-slate-600">
                          ({formatHirePricePeriodSuffix(service.pricingPeriod)})
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-xl border border-sky-200/60 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-sky-100/40">
                    {formatStockLabel(service.listingType, service.stock)}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-foreground/80">
                  {formatStockLabel(service.listingType, service.stock)}
                </p>
              )}

              {service.listingType === "hire" &&
              service.pricingPeriod &&
              typeof service.price !== "number" ? (
                <p
                  className={
                    isPublic
                      ? "mt-3 text-sm font-medium text-slate-600"
                      : "mt-2 text-sm font-medium text-foreground/80"
                  }
                >
                  Billing period: {formatPricingPeriodLabel(service.pricingPeriod)}
                </p>
              ) : null}

              {returnSummary ? (
                <p
                  className={
                    isPublic
                      ? "mt-4 rounded-xl border border-cyan-200/50 bg-cyan-50/60 px-4 py-3 text-sm text-slate-700 ring-1 ring-cyan-100/40"
                      : "mt-4 rounded-xl border border-ambuhub-100 bg-ambuhub-50/80 px-4 py-3 text-sm text-foreground/90"
                  }
                >
                  <span className="font-semibold text-[#0c4a6e]">Return schedule: </span>
                  {returnSummary}
                </p>
              ) : null}

              {hasLocation ? (
                <div
                  className={
                    isPublic
                      ? "mt-4 flex gap-3 rounded-xl border border-cyan-200/45 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-cyan-50"
                      : "mt-4 flex gap-2 rounded-xl border border-ambuhub-100 bg-white px-4 py-3 text-sm text-foreground/85 shadow-sm"
                  }
                >
                  <MapPin
                    className={`mt-0.5 h-4 w-4 shrink-0 ${isPublic ? "text-cyan-600" : "text-ambuhub-brand"}`}
                    aria-hidden
                  />
                  <div className="space-y-1">
                    {service.officeAddress?.trim() ? (
                      <p className={isPublic ? "font-medium" : undefined}>
                        {service.officeAddress.trim()}
                      </p>
                    ) : null}
                    <p className={isPublic ? "text-slate-500" : "text-foreground/70"}>
                      {[
                        service.stateProvinceName ||
                          service.stateProvince ||
                          null,
                        countryName || service.countryCode || null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          <article className={`${descCardClass} p-5 sm:p-6`}>
            {isPublic ? <div className={neonTopBar} aria-hidden /> : null}
            <div className={isPublic ? "relative" : undefined}>
              <h2
                className={
                  isPublic
                    ? "text-lg font-bold text-[#0c4a6e]"
                    : "text-lg font-semibold text-foreground"
                }
              >
                Description
              </h2>
              <p
                className={
                  isPublic
                    ? "mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700"
                    : "mt-3 whitespace-pre-wrap text-base leading-relaxed text-foreground/85"
                }
              >
                {service.description}
              </p>
            </div>
          </article>

          {!isPublic && (actions || children) ? (
            <div className="space-y-8">
              {actions}
              {children}
            </div>
          ) : null}
        </div>

        {isPublic && actions ? (
          <aside className="lg:sticky lg:top-24">
            <div className={`${neonCard} p-5 sm:p-6`}>
              <NeonOrbs />
              <div className={neonTopBar} aria-hidden />
              <div className="relative space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  Actions
                </p>
                <p className="text-sm text-slate-600">
                  Purchase, hire, or save this listing.
                </p>
              </div>
              <div className="relative mt-5">{actions}</div>
            </div>
          </aside>
        ) : null}
      </div>

      {isPublic && children ? (
        <div className="mt-10">{children}</div>
      ) : null}
    </div>
  );
}
