import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesGridSection } from "@/components/landing/ServicesGridSection";
import { HowToUseSection } from "@/components/landing/HowToUseSection";
import { ImageStorySections } from "@/components/landing/ImageStorySections";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-blue-50/40">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-blue-50/30 via-sky-50/20 to-blue-100/25">
        <HeroSection />
        <ServicesGridSection />
        <HowToUseSection />
        <ImageStorySections />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
