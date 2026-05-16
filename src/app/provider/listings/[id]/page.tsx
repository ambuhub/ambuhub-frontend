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
import { useCallback, useEffect, useState } from "react";

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
      <div className="mx-auto max-w-3xl px-1 sm:px-0">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200/80" />
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-slate-200/60" />
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-slate-200/50" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
          {error ?? "Listing not found."}
        </p>
        <Link
          href="/provider/listings"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
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
    <div className="mx-auto max-w-4xl">
      <Link
        href="/provider/listings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition hover:text-blue-950"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        My listings
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 shadow-2xl shadow-blue-950/40">
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 0% 0%, rgb(56 189 248 / 0.4), transparent 45%), radial-gradient(circle at 100% 100%, rgb(129 140 248 / 0.35), transparent 42%)",
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
                  <span className="rounded-full bg-cyan-400/25 px-3 py-1 text-xs font-semibold capitalize text-cyan-50 ring-1 ring-cyan-300/40">
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
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-blue-900 shadow-lg transition hover:bg-sky-50 lg:flex-none"
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

      <div className="mt-8 grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          {service.photoUrls.length > 0 ? (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-blue-200/80 bg-slate-100 shadow-lg shadow-blue-900/10">
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
                      className="relative aspect-square overflow-hidden rounded-lg border border-blue-100 bg-slate-50"
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
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200/90 bg-gradient-to-br from-slate-50 to-blue-50/50 text-slate-500">
              <ImageIcon className="h-12 w-12 opacity-40" aria-hidden />
              <p className="mt-2 text-sm font-medium">No photos yet</p>
              <p className="mt-1 px-6 text-center text-xs text-slate-500">
                Add images when you update this listing.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-sky-50/80 p-4 shadow-md shadow-blue-100/40">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700/80">
                <Tag className="h-3.5 w-3.5" aria-hidden />
                Price
              </div>
              <p className="mt-2 text-lg font-bold text-blue-950">
                {formatPrice(service.price)}
                {service.listingType === "hire" && service.pricingPeriod ? (
                  <span className="mt-1 block text-sm font-semibold text-blue-900/80">
                    {formatHirePricePeriodSuffix(service.pricingPeriod)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-cyan-50/70 p-4 shadow-md shadow-cyan-100/30">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-800/85">
                <Layers className="h-3.5 w-3.5" aria-hidden />
                Stock
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {service.stock != null ? service.stock : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 p-4 shadow-md shadow-indigo-100/30 sm:col-span-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-800/85">
                Listing type
              </div>
              <p className="mt-2 text-lg font-bold capitalize text-indigo-950">
                {service.listingType ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-slate-200/60 sm:p-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900/80">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
              {service.description}
            </p>
          </div>

          {service.countryCode ||
          service.stateProvince ||
          service.officeAddress ? (
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-slate-200/60 sm:p-7">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-900/80">
                <MapPin className="h-4 w-4" aria-hidden />
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
            </div>
          ) : null}

          {service.listingType === "hire" && service.hireReturnWindow ? (
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-slate-200/60 sm:p-7">
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900/80">
                Return schedule
              </h2>
              <p className="mt-3 text-sm text-slate-700">
                {formatHireReturnWindowSummary(service.hireReturnWindow)}
              </p>
            </div>
          ) : null}
        </div>
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
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
      ) : null}
    </div>
  );
}
