import { useState, useEffect } from "react";
import ExclusivityBar from "@/components/landing/ExclusivityBar";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SellerScene from "@/components/landing/SellerScene";
import ListingScene from "@/components/landing/ListingScene";
import BuyerScene from "@/components/landing/BuyerScene";
import ActionStrip from "@/components/landing/ActionStrip";
import ListingsShowcase from "@/components/landing/ListingsShowcase";
import FoundersSection from "@/components/landing/FoundersSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

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
      <div className="relative overflow-hidden">
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
      <FoundersSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
