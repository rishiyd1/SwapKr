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
import FeedbackSection from "@/components/landing/FeedbackSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import LoginModal from "@/components/landing/LoginModal";

const Index = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExclusivityBar />
      <Navbar onLogin={() => setLoginOpen(true)} />
      <HeroSection onStart={() => setLoginOpen(true)} />
      <SellerScene />
      <ListingScene />
      <BuyerScene />
      <ActionStrip />
      <ListingsShowcase />
      <FoundersSection />
      <FeedbackSection />
      <FinalCTA onStart={() => setLoginOpen(true)} />
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Index;
