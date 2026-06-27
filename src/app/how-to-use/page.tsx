import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HowToUsePageContent } from "@/components/how-to-use/HowToUsePageContent";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "How to use",
  "Learn how to use Ambuhub as a client or provider—sign up, browse services, book coverage, publish listings, and manage everything from your dashboard.",
);

export default function HowToUsePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <HowToUsePageContent />
      </main>
      <Footer />
    </div>
  );
}
