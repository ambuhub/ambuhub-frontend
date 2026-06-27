import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServicesPageContent } from "@/components/services/ServicesPageContent";
import {
  fetchLandingServiceCategories,
  orderLandingCategories,
} from "@/lib/landing-service-categories";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "Services",
  "Browse Ambuhub service categories: medical transport, ambulance personnel, fleet servicing, and equipment from verified marketplace providers.",
);

export default async function ServicesIndexPage() {
  const rows = await fetchLandingServiceCategories();
  const categories = orderLandingCategories(rows);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <ServicesPageContent categories={categories} />
      </main>
      <Footer />
    </div>
  );
}
