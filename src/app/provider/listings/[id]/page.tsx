"use client";

import { API_PROXY_PREFIX } from "@/lib/api";
import { dispatchMarketplaceInvalidate } from "@/lib/cache-tags";
import { getCountryNameByCode } from "@/lib/countries";
import { formatHireReturnWindowSummary, type HireReturnWindow } from "@/lib/hire-return-window";
import { formatHirePricePeriodSuffix } from "@/lib/pricing-period";
import {
  ArrowLeft,
  Calendar,
  ImageIcon,
  Layers,
  MapPin,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ServiceReviewsSection } from "@/components/reviews/ServiceReviewsSection";

const neonCard =
  "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/50 to-cyan-100/35 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35),0_8px_24px_-12px_rgba(0,74,124,0.18)] ring-1 ring-cyan-200/40";

const neonCardMuted =
  "relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-white/95 shadow-[0_0_24px_-8px_rgba(34,211,238,0.22),0_6px_20px_-10px_rgba(15,23,42,0.12)] ring-1 ring-sky-100/60";

const neonTopBar =
  "pointer-events-none absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]";

const neonPhotoFrame =
  "relative overflow-hidden rounded-2xl border-2 border-cyan-400/50 bg-slate-100 shadow-[0_0_40px_-6px_rgba(34,211,238,0.45),0_12px_32px_-16px_rgba(0,74,124,0.25)] ring-2 ring-cyan-200/30";

function NeonCard({
  children,
  className = "",
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <div className={`${muted ? neonCardMuted : neonCard} ${className}`}>
      <div className={neonTopBar} aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

type MyService = {
  id: string;
  title: string;
  description: string;
  listingType: "sale" | "hire" | "book" | null;
  stock: number | null;
  price: number | null;
  pricingPeriod:
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | null;
  isAvailable?: boolean;
  departmentSlug: string;
  departmentName: string;
  category: { id: string; slug: string; name: string };
  photoUrls: string[];
  countryCode: string | null;
  stateProvince: string | null;
  stateProvinceName: string | null;
  officeAddress: string | null;
  hireReturnWindow: HireReturnWindow | null;
  createdAt: string;
  updatedAt: string;
};

function formatPrice(n: number | null): string {
  if (n == null) return "—";
  return `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function ProviderListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [service, setService] = useState<MyService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_PROXY_PREFIX}/services/me/${id}`, {
        credentials: "include",
      });
      const data = (await res.json()) as { service?: MyService; message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? "Could not load this listing.");
      }
      setService(data.service ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete() {
    if (!id) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`${API_PROXY_PREFIX}/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Could not delete listing.";
        try {
          const data = text ? (JSON.parse(text) as { message?: string }) : {};
          if (data.message) message = data.message;
        } catch {
          /* use default */
        }
        throw new Error(message);
      }
      dispatchMarketplaceInvalidate();
      router.push("/provider/listings");
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="relative mx-auto max-w-4xl px-1 sm:px-0">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden
        />
        <div className="h-10 w-48 animate-pulse rounded-lg bg-cyan-100/60 shadow-[0_0_20px_rgba(34,211,238,0.15)]" />
        <div className="mt-8 h-64 animate-pulse rounded-3xl border border-cyan-200/50 bg-gradient-to-br from-sky-50 to-cyan-50/80 shadow-[0_0_32px_-8px_rgba(34,211,238,0.2)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 animate-pulse rounded-2xl border border-cyan-100 bg-white/80 shadow-md"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-4 text-sm text-red-900 shadow-lg shadow-red-100/50">
          {error ?? "Listing not found."}
        </p>
        <Link
          href="/provider/listings"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0069b4] transition hover:text-cyan-600 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to my listings
        </Link>
      </div>
    );
  }

  const created = new Date(service.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const updated = new Date(service.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative mx-auto max-w-4xl">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-48 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-32 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"
        aria-hidden
      />

      <Link
        href="/provider/listings"
        className="relative inline-flex items-center gap-2 rounded-lg px-1 text-sm font-semibold text-[#004a7c] transition hover:text-cyan-600 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        My listings
      </Link>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#003d66] via-blue-950 to-indigo-950 shadow-[0_0_48px_-8px_rgba(34,211,238,0.35),0_20px_50px_-20px_rgba(0,30,60,0.55)] ring-1 ring-cyan-300/25">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.7)]"
          aria-hidden
        />
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-14 -top-12 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 0% 0%, rgb(34 211 238 / 0.35), transparent 48%), radial-gradient(circle at 100% 100%, rgb(129 140 248 / 0.3), transparent 45%)",
            }}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100">
                  {service.category.name}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                  {service.departmentName}
                </span>
                {service.listingType ? (
                  <span className="rounded-full border border-cyan-300/50 bg-cyan-400/25 px-3 py-1 text-xs font-semibold capitalize text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,0.35)] ring-1 ring-cyan-200/40">
                    {service.listingType}
                  </span>
                ) : null}
                {service.isAvailable === false ? (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100 ring-1 ring-amber-200/50">
                    Hidden from marketplace
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {service.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-sky-100/85">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  Created {created}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  Updated {updated}
                </span>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
              <Link
                href={`/provider/listings/${service.id}/edit`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-200/60 bg-white px-5 py-3.5 text-sm font-semibold text-[#004a7c] shadow-[0_0_24px_-4px_rgba(34,211,238,0.45),0_4px_14px_rgba(0,0,0,0.15)] transition hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-[0_0_32px_-2px_rgba(34,211,238,0.55)] lg:flex-none"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Update listing
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300/50 bg-red-500/15 px-5 py-3.5 text-sm font-semibold text-red-100 backdrop-blur transition hover:bg-red-500/25 lg:flex-none"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          {service.photoUrls.length > 0 ? (
            <div className="space-y-3">
              <div className={`${neonPhotoFrame} aspect-[4/3]`}>
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#004a7c]/20 via-transparent to-cyan-400/10" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.photoUrls[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {service.photoUrls.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {service.photoUrls.slice(1, 9).map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-xl border border-cyan-300/45 bg-slate-50 shadow-[0_0_16px_-6px_rgba(34,211,238,0.25)] ring-1 ring-white/80 transition hover:border-cyan-400/60 hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.4)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-cyan-300/50 bg-gradient-to-br from-slate-50 via-sky-50/80 to-cyan-50/40 text-slate-500 shadow-[0_0_28px_-8px_rgba(34,211,238,0.2)]">
              <div className={neonTopBar} aria-hidden />
              <ImageIcon className="relative h-12 w-12 text-cyan-400/50" aria-hidden />
              <p className="relative mt-2 text-sm font-medium text-[#004a7c]/80">
                No photos yet
              </p>
              <p className="relative mt-1 px-6 text-center text-xs text-slate-500">
                Add images when you update this listing.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NeonCard className="p-4 pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0069b4]">
                <Tag className="h-3.5 w-3.5 text-cyan-500" aria-hidden />
                Price
              </div>
              <p className="mt-2 text-lg font-bold text-[#004a7c]">
                {formatPrice(service.price)}
                {service.listingType === "hire" && service.pricingPeriod ? (
                  <span className="mt-1 block text-sm font-semibold text-cyan-800/85">
                    {formatHirePricePeriodSuffix(service.pricingPeriod)}
                  </span>
                ) : null}
              </p>
            </NeonCard>
            <NeonCard className="p-4 pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                <Layers className="h-3.5 w-3.5 text-cyan-500" aria-hidden />
                Stock
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {service.stock != null ? service.stock : "—"}
              </p>
            </NeonCard>
            <NeonCard className="p-4 pt-5 sm:col-span-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800/90">
                Listing type
              </div>
              <p className="mt-2 text-lg font-bold capitalize text-indigo-950">
                {service.listingType ?? "N/A"}
              </p>
            </NeonCard>
          </div>

          <NeonCard muted className="p-5 sm:p-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#004a7c]">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
              {service.description}
            </p>
          </NeonCard>

          {service.countryCode ||
          service.stateProvince ||
          service.officeAddress ? (
            <NeonCard muted className="p-5 sm:p-7">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#004a7c]">
                <MapPin className="h-4 w-4 text-cyan-500" aria-hidden />
                Office location
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-slate-700">
                {service.countryCode ? (
                  <div>
                    <dt className="font-semibold text-slate-500">Country</dt>
                    <dd>
                      {getCountryNameByCode(service.countryCode) ??
                        service.countryCode}
                    </dd>
                  </div>
                ) : null}
                {service.stateProvince || service.stateProvinceName ? (
                  <div>
                    <dt className="font-semibold text-slate-500">State / province</dt>
                    <dd>
                      {service.stateProvinceName ?? service.stateProvince}
                    </dd>
                  </div>
                ) : null}
                {service.officeAddress ? (
                  <div>
                    <dt className="font-semibold text-slate-500">Address</dt>
                    <dd className="whitespace-pre-wrap">{service.officeAddress}</dd>
                  </div>
                ) : null}
              </dl>
            </NeonCard>
          ) : null}

          {service.listingType === "hire" && service.hireReturnWindow ? (
            <NeonCard muted className="p-5 sm:p-7">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#004a7c]">
                Return schedule
              </h2>
              <p className="mt-3 text-sm text-slate-700">
                {formatHireReturnWindowSummary(service.hireReturnWindow)}
              </p>
            </NeonCard>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <ServiceReviewsSection serviceId={service.id} variant="provider" />
      </div>

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteOpen(false);
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-200/60 bg-white p-6 pt-7 shadow-[0_0_40px_-8px_rgba(34,211,238,0.35),0_20px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-cyan-100/80">
            <div className={neonTopBar} aria-hidden />
            <div className="relative">
            <h2
              id="delete-dialog-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete this listing?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This removes &quot;{service.title}&quot; from the marketplace. You
              cannot undo this action.
            </p>
            {deleteError ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete listing"}
              </button>
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
