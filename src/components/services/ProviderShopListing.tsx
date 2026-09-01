import Link from "next/link";
import { formatMoney, parseSupportedCurrency } from "@/lib/currency";
import { toTitleCase } from "@/lib/landing-service-categories";
import type { MarketplaceServiceRow } from "@/lib/service-category-page-data";
import type { ShopCategorySection } from "@/lib/provider-shop";
import { ServiceCardImage } from "@/components/services/CategoryServiceListing";

function formatListingTypeLabel(
  listingType: "sale" | "hire" | "book" | null,
): string {
  if (listingType === "hire") return "Hire";
  if (listingType === "book") return "Book";
  if (listingType === "sale") return "Sale";
  return "Listing";
}

function formatPrice(svc: MarketplaceServiceRow): string {
  if (svc.price == null) {
    return "Contact for price";
  }
  const currency = parseSupportedCurrency(svc.currency, "NGN");
  const base = formatMoney(svc.price, currency);
  if (svc.listingType === "hire" || svc.listingType === "book") {
    return `${base} / day`;
  }
  return base;
}

type Props = {
  sections: ShopCategorySection[];
  browseCountry?: "NG" | "GH";
};

export function ProviderShopListing({ sections, browseCountry }: Props) {
  if (sections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-600">
        No listings available yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {sections.map((category) => (
        <section key={category.key} aria-labelledby={`shop-cat-${category.key}`}>
          <h2
            id={`shop-cat-${category.key}`}
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            {toTitleCase(category.heading)}
          </h2>
          <div className="mt-6 flex flex-col gap-10">
            {category.departments.map((dept) => (
              <div key={dept.key}>
                <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                  {toTitleCase(dept.heading)}
                </h3>
                <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {dept.services.map((svc) => {
                    const countryQs = browseCountry
                      ? `?countryCode=${encodeURIComponent(browseCountry)}`
                      : svc.countryCode
                        ? `?countryCode=${encodeURIComponent(svc.countryCode)}`
                        : "";
                    const href = `/services/${encodeURIComponent(category.categorySlug)}/${encodeURIComponent(svc.id)}${countryQs}`;
                    return (
                      <li key={svc.id}>
                        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
                            <Link
                              href={href}
                              className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <span className="sr-only">
                                View details: {svc.title}
                              </span>
                              <ServiceCardImage
                                photoUrl={svc.photoUrls[0]}
                                alt={svc.title}
                              />
                            </Link>
                            <span className="pointer-events-none absolute bottom-3 left-3 z-[1] rounded-md bg-black/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                              {formatListingTypeLabel(svc.listingType)}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <Link
                              href={href}
                              className="text-sm font-semibold text-slate-900 hover:text-blue-700"
                            >
                              {svc.title}
                            </Link>
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {formatPrice(svc)}
                            </p>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
