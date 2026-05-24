import { Building2, Globe, MapPin, Phone, User } from "lucide-react";
import { getCountryNameByCode } from "@/lib/countries";
import type { MarketplaceListingProvider } from "@/lib/service-category-page-data";

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

type Props = {
  provider: MarketplaceListingProvider;
  variant?: "public" | "client";
};

export function ListingProviderSection({ provider, variant = "public" }: Props) {
  const isPublic = variant === "public";
  const countryName = provider.countryCode
    ? getCountryNameByCode(provider.countryCode)
    : null;
  const websiteHref = provider.website ? formatWebsiteHref(provider.website) : "";

  const cardClass = isPublic
    ? "relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-white via-sky-50/50 to-cyan-100/35 p-5 shadow-[0_0_32px_-8px_rgba(34,211,238,0.35)] ring-1 ring-cyan-200/40 sm:p-6"
    : "rounded-2xl border border-ambuhub-100 bg-white p-5 shadow-sm sm:p-6";

  const topBar = isPublic ? (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004a7c] via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.55)]"
      aria-hidden
    />
  ) : null;

  const headingClass = isPublic
    ? "text-lg font-bold text-[#004a7c]"
    : "text-lg font-semibold text-foreground";

  return (
    <article className={cardClass}>
      {topBar}
      <div className={isPublic ? "relative" : undefined}>
        <div className="flex items-start gap-3">
          <span
            className={
              isPublic
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-cyan-600 text-white shadow-md"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ambuhub-brand text-white"
            }
          >
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className={headingClass}>Service provider</h2>
            <p
              className={
                isPublic
                  ? "mt-1 text-base font-semibold text-slate-900"
                  : "mt-1 text-base font-semibold text-foreground"
              }
            >
              {provider.businessName}
            </p>
            {provider.contactName ? (
              <p
                className={
                  isPublic
                    ? "mt-1 flex items-center gap-1.5 text-sm text-slate-600"
                    : "mt-1 flex items-center gap-1.5 text-sm text-foreground/70"
                }
              >
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Contact: {provider.contactName}
              </p>
            ) : null}
          </div>
        </div>

        <ul className="mt-5 space-y-3 text-sm">
          {provider.physicalAddress ? (
            <li
              className={
                isPublic
                  ? "flex gap-3 rounded-xl border border-cyan-200/45 bg-white/85 px-4 py-3 text-slate-700 ring-1 ring-cyan-50"
                  : "flex gap-3 rounded-xl border border-ambuhub-100 bg-ambuhub-surface/40 px-4 py-3"
              }
            >
              <MapPin
                className={`mt-0.5 h-4 w-4 shrink-0 ${isPublic ? "text-cyan-600" : "text-ambuhub-brand"}`}
                aria-hidden
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Company address
                </p>
                <p className="mt-0.5 font-medium">{provider.physicalAddress}</p>
                {countryName ? (
                  <p className="mt-0.5 text-slate-500">{countryName}</p>
                ) : null}
              </div>
            </li>
          ) : null}

          {provider.phone ? (
            <li
              className={
                isPublic
                  ? "flex gap-3 rounded-xl border border-cyan-200/45 bg-white/85 px-4 py-3 text-slate-700 ring-1 ring-cyan-50"
                  : "flex gap-3 rounded-xl border border-ambuhub-100 bg-ambuhub-surface/40 px-4 py-3"
              }
            >
              <Phone
                className={`mt-0.5 h-4 w-4 shrink-0 ${isPublic ? "text-cyan-600" : "text-ambuhub-brand"}`}
                aria-hidden
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                <a
                  href={`tel:${provider.phone.replace(/\s/g, "")}`}
                  className={
                    isPublic
                      ? "mt-0.5 inline-block font-medium text-[#0069b4] hover:underline"
                      : "mt-0.5 inline-block font-medium text-ambuhub-brand hover:underline"
                  }
                >
                  {provider.phone}
                </a>
              </div>
            </li>
          ) : null}

          {websiteHref ? (
            <li
              className={
                isPublic
                  ? "flex gap-3 rounded-xl border border-cyan-200/45 bg-white/85 px-4 py-3 text-slate-700 ring-1 ring-cyan-50"
                  : "flex gap-3 rounded-xl border border-ambuhub-100 bg-ambuhub-surface/40 px-4 py-3"
              }
            >
              <Globe
                className={`mt-0.5 h-4 w-4 shrink-0 ${isPublic ? "text-cyan-600" : "text-ambuhub-brand"}`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Website
                </p>
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    isPublic
                      ? "mt-0.5 inline-block break-all font-medium text-[#0069b4] hover:underline"
                      : "mt-0.5 inline-block break-all font-medium text-ambuhub-brand hover:underline"
                  }
                >
                  {provider.website}
                </a>
              </div>
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}
