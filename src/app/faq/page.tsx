import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqPageContent } from "@/components/faq/FaqPageContent";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "FAQ",
  "Frequently asked questions about Ambuhub—booking ambulance coverage, hiring personnel, listing services, payments, and trust & safety on the marketplace.",
);

export default function FaqPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <FaqPageContent />
      </main>
      <Footer />
    </div>
  );
}
