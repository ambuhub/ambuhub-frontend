import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesGridSection } from "@/components/landing/ServicesGridSection";
import { ImageStorySections } from "@/components/landing/ImageStorySections";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesGridSection />
        <ImageStorySections />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
