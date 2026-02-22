import { useState, useEffect, lazy, Suspense } from "react";
import ExclusivityBar from "@/components/landing/ExclusivityBar";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SellerScene from "@/components/landing/SellerScene";
import ListingScene from "@/components/landing/ListingScene";
import BuyerScene from "@/components/landing/BuyerScene";
import ActionStrip from "@/components/landing/ActionStrip";
import ListingsShowcase from "@/components/landing/ListingsShowcase";
import Footer from "@/components/landing/Footer";
import SpinnerLogo from "@/components/SpinnerLogo";

// Lazy-load heavy sections
const FoundersSection = lazy(
  () => import("@/components/landing/FoundersSection"),
);
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA"));

const Index = () => {
  const [logoActivated, setLogoActivated] = useState(false);

  useEffect(() => {
    // Check for hash and scroll to it
    const { hash } = window.location;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 500); // Small delay to ensure components are rendered
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExclusivityBar />
      <Navbar logoActivated={logoActivated} />
      <HeroSection onLogoActivate={setLogoActivated} />
      <div className="flex flex-col gap-32 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <SellerScene />
        <ListingScene />
        <BuyerScene />
      </div>
      <ActionStrip />
      <ListingsShowcase />
      <Suspense fallback={<SpinnerLogo size={40} />}>
        <FoundersSection />
        <FinalCTA />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
