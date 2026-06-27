import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { publicPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = publicPageMetadata(
  "Contact",
  "Get in touch with the Ambuhub team about booking ambulance coverage, listing your services, partnerships, or support.",
);

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        <ContactPageContent />
      </main>
      <Footer />
    </div>
  );
}
