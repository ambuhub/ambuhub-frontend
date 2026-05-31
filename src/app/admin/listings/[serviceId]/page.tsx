"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";
import {
  fetchAdminListingDetail,
  patchAdminListingAvailability,
  type AdminListingDetail,
} from "@/lib/admin-listings";
import { getCountryNameByCode } from "@/lib/countries";
import type { HireReturnWindow } from "@/lib/hire-return-window";
import {
  formatHireReturnWindowSummary,
  hasValidHireReturnWindow,
} from "@/lib/hire-return-window";
import { FALLBACK_THUMB } from "@/lib/landing-service-categories";
import {
  formatHirePricePeriodSuffix,
  formatPricingPeriodLabel,
  isPricingPeriod,
} from "@/lib/pricing-period";

const currencyFmt = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

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

function listingTypeLabel(type: AdminListingDetail["listingType"]): string {
  if (type === "sale") return "Sale";
  if (type === "hire") return "Hire";
  if (type === "book") return "Personnel";
  return "Not specified";
}

function providerLabel(listing: AdminListingDetail): string {
  if (listing.businessName?.trim()) return listing.businessName.trim();
  return listing.providerName;
}

function ListingPhotoGallery({ listing }: { listing: AdminListingDetail }) {
  const photos =
    listing.photoUrls.length > 0
      ? listing.photoUrls.map((url) => url.trim()).filter(Boolean)
      : [];

  if (photos.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FALLBACK_THUMB}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const [first, ...rest] = photos;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={first}
          alt={`${listing.title} — photo 1`}
          className="h-full w-full object-cover"
        />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rest.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${listing.title} — photo ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminListingDetailPage() {
  const params = useParams();
  const serviceId = typeof params.serviceId === "string" ? params.serviceId : "";

  const [listing, setListing] = useState<AdminListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    if (!serviceId) {
      setError("Invalid listing id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminListingDetail(serviceId);
      setListing(data);
    } catch (err) {
      setListing(null);
      setError(err instanceof Error ? err.message : "Could not load listing.");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  async function handleAvailabilityChange(isAvailable: boolean) {
    if (!listing) return;
    if (
      !isAvailable &&
      !window.confirm(
        "Take down this listing? It will be hidden from the marketplace until restored.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    setActionMessage(null);
    try {
      await patchAdminListingAvailability(listing.id, isAvailable);
      const refreshed = await fetchAdminListingDetail(listing.id);
      setListing(refreshed);
      setActionMessage(
        isAvailable
          ? "Listing restored and visible on the marketplace."
          : "Listing taken down and hidden from the marketplace.",
      );
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Could not update listing.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const countryName = listing?.countryCode
    ? getCountryNameByCode(listing.countryCode) ?? listing.countryCode
    : null;
  const stateLabel =
    listing?.stateProvinceName?.trim() ||
    listing?.stateProvince?.trim() ||
    null;
  const locationParts = [
    listing?.officeAddress?.trim(),
    stateLabel,
    countryName,
  ].filter(Boolean);
  const hireReturnWindow = listing?.hireReturnWindow as HireReturnWindow | null | undefined;
  const hireReturnSummary =
    listing?.listingType === "hire" && hasValidHireReturnWindow(hireReturnWindow)
      ? formatHireReturnWindowSummary(hireReturnWindow)
      : null;
  const marketplaceHref = listing
    ? `/services/${encodeURIComponent(listing.categorySlug)}/${encodeURIComponent(listing.id)}`
    : "#";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to listings
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
      ) : listing ? (
        <>
          <AdminPageHeader
            title={listing.title}
            description={`${listing.categoryName} · ${listing.departmentName} · Updated ${formatDateTime(listing.updatedAt)}`}
          />

          {actionMessage ? (
            <div
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"
              role="status"
            >
              {actionMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                listing.isLive
                  ? "bg-emerald-100 text-emerald-900 ring-emerald-200/80"
                  : "bg-rose-100 text-rose-900 ring-rose-200/80"
              }`}
            >
              {listing.isLive ? "Live on marketplace" : "Taken down"}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
              {listingTypeLabel(listing.listingType)}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <ListingPhotoGallery listing={listing} />

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {listing.description.trim() || "No description provided."}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Listing details
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Category</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {listing.categoryName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Department</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {listing.departmentName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Price</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {listing.price != null
                        ? listing.listingType === "hire" &&
                          listing.pricingPeriod &&
                          isPricingPeriod(listing.pricingPeriod)
                          ? `${currencyFmt.format(listing.price)} (${formatHirePricePeriodSuffix(listing.pricingPeriod)})`
                          : currencyFmt.format(listing.price)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Stock</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {listing.listingType === "sale" || listing.listingType === "hire"
                        ? listing.stock != null
                          ? listing.stock
                          : "—"
                        : "N/A"}
                    </dd>
                  </div>
                  {listing.pricingPeriod ? (
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Pricing period
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        {isPricingPeriod(listing.pricingPeriod)
                          ? formatPricingPeriodLabel(listing.pricingPeriod)
                          : listing.pricingPeriod}
                      </dd>
                    </div>
                  ) : null}
                  {listing.bookingGapHours != null ? (
                    <div>
                      <dt className="text-xs font-medium text-slate-500">
                        Booking gap
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        {listing.bookingGapHours} hour
                        {listing.bookingGapHours === 1 ? "" : "s"}
                      </dd>
                    </div>
                  ) : null}
                  {hireReturnSummary ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        Hire return window
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        {hireReturnSummary}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Created</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDateTime(listing.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Listing ID</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                      {listing.id}
                    </dd>
                  </div>
                </dl>
              </section>

              {locationParts.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <MapPin className="h-4 w-4" aria-hidden />
                    Location
                  </h2>
                  <p className="mt-3 text-sm text-slate-700">
                    {locationParts.join(" · ")}
                  </p>
                </section>
              ) : null}

              <ServiceReviewsSection
                serviceId={listing.id}
                variant="admin"
                limit={50}
              />
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Package className="h-4 w-4" aria-hidden />
                  Moderation
                </h2>
                <div className="mt-4 space-y-3">
                  {listing.isLive ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleAvailabilityChange(false)}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      {actionLoading ? "Updating…" : "Take down listing"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleAvailabilityChange(true)}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {actionLoading ? "Updating…" : "Restore listing"}
                    </button>
                  )}
                  <Link
                    href={marketplaceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    View on marketplace
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Provider
                </h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {providerLabel(listing)}
                    </p>
                    {listing.provider?.contactName ? (
                      <p className="text-sm text-slate-600">
                        Contact: {listing.provider.contactName}
                      </p>
                    ) : null}
                  </div>
                  {listing.providerEmail ? (
                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      {listing.providerEmail}
                    </p>
                  ) : null}
                  {listing.provider?.phone ? (
                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      {listing.provider.phone}
                    </p>
                  ) : null}
                  {listing.provider?.physicalAddress ? (
                    <p className="text-sm text-slate-700">
                      {listing.provider.physicalAddress}
                    </p>
                  ) : null}
                  {listing.provider?.website ? (
                    <a
                      href={listing.provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      Website
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : null}
                  <Link
                    href={`/admin/users/${encodeURIComponent(listing.providerUserId)}`}
                    className="inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    Open provider profile
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
