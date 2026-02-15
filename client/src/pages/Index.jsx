import { useState } from "react";
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
import LoginModal from "@/components/landing/LoginModal";

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoActivated, setLogoActivated] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExclusivityBar />
      <Navbar onLogin={() => setLoginOpen(true)} logoActivated={logoActivated} />
      <HeroSection onStart={() => setLoginOpen(true)} onLogoActivate={setLogoActivated} />
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
      <FinalCTA onStart={() => setLoginOpen(true)} />
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Index;
