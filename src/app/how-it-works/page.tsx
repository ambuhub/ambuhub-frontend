import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HowItWorksPageContent } from "@/components/how-it-works/HowItWorksPageContent";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "How it works",
  "See how Ambuhub works—discover providers, compare and confirm details, then book ambulance coverage, hire personnel, service fleets, and trade equipment in one marketplace.",
);

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <HowItWorksPageContent />
      </main>
      <Footer />
    </div>
  );
}
