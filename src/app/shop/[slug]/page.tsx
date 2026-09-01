import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProviderShopListing } from "@/components/services/ProviderShopListing";
import {
  BROWSE_COUNTRY_COOKIE,
  parseBrowseCountry,
  type MarketplaceBrowseCountry,
} from "@/lib/browse-country";
import {
  fetchProviderShopBySlug,
  groupShopServicesByCategory,
} from "@/lib/provider-shop";
import { publicPageMetadata } from "@/lib/seo-metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ countryCode?: string }>;
};

async function resolveBrowseCountry(
  queryCountry?: string,
): Promise<MarketplaceBrowseCountry | undefined> {
  const fromQuery = parseBrowseCountry(queryCountry);
  if (fromQuery) {
    return fromQuery;
  }
  const jar = await cookies();
  return parseBrowseCountry(jar.get(BROWSE_COUNTRY_COOKIE)?.value) ?? undefined;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shopPayload = await fetchProviderShopBySlug(slug);
  if (!shopPayload) {
    return { title: "Shop" };
  }
  return publicPageMetadata(
    shopPayload.shop.businessName,
    `Browse services from ${shopPayload.shop.businessName} on Ambuhub.`,
  );
}

export default async function ProviderShopPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const browseCountry = await resolveBrowseCountry(sp.countryCode);

  const payload = await fetchProviderShopBySlug(slug, browseCountry);
  if (!payload) {
    notFound();
  }

  const sections = groupShopServicesByCategory(payload.services);
  const { shop } = payload;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <header className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Provider shop
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {shop.businessName}
            </h1>
            {shop.physicalAddress ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>{shop.physicalAddress}</span>
              </p>
            ) : null}
            {shop.website ? (
              <a
                href={
                  shop.website.startsWith("http")
                    ? shop.website
                    : `https://${shop.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
              >
                Website
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}
          </header>

          <ProviderShopListing
            sections={sections}
            browseCountry={browseCountry}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
