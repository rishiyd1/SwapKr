import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, MessageSquare, Tag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * GuestItemCard — same look as ItemCard but blocks interaction for unauthenticated users.
 * Clicking any interactive element prompts the user to log in.
 */
const GuestItemCard = ({
  id,
  title,
  price,
  category,
  time,
  image,
  condition,
  className = "",
  ...props
}) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const images = Array.isArray(image) ? image : [image];
  const currentImage = images[currentImageIndex];

  useEffect(() => {
    let interval;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const handleInteraction = (e) => {
    e.stopPropagation();
    setShowLoginPrompt(true);
  };

  const handleCardClick = () => {
    // Viewing the detail page also requires login
    setShowLoginPrompt(true);
  };

  return (
    <>
      <motion.div
        className={`group relative bg-card/40 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 backdrop-blur-sm cursor-pointer flex flex-col ${className}`}
        whileHover={{ y: -6, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        {...props}
      >
        {/* Visual background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Image Container */}
        <div className="aspect-[4/4] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0.8, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.8, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              {typeof currentImage === "string" && currentImage.startsWith("http") ? (
                <img
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground/20 font-display font-bold text-5xl">
                  {currentImage || "ITEM"}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Condition Tag */}
          {condition && (
            <div className="absolute top-3 right-3 z-10">
              <div className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full bg-background/90 backdrop-blur-md text-primary border border-primary/20 shadow-lg">
                {condition}
              </div>
            </div>
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 px-2 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "bg-primary w-3" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}

          {/* Guest Overlay Hint on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col items-center gap-2 text-white">
              <Lock className="w-6 h-6" />
              <span className="text-xs font-semibold">Login to view</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 relative z-10 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-display font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <span className="text-primary font-bold text-sm whitespace-nowrap ml-2">
                ₹{price}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md border border-white/5">
                <Tag className="w-3 h-3 text-accent" />
                {category || "Uncategorized"}
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <Clock className="w-3 h-3" />
                {time || "Recently"}
              </span>
            </div>
          </div>

          {/* Login-gated Action Button */}
          <Button
            className="w-full h-8 gap-1.5 font-display text-[11px] sm:text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-300 mt-auto"
            variant="outline"
            onClick={handleInteraction}
          >
            <MessageSquare className="w-4 h-4" />
            Login to Contact
          </Button>
        </div>
      </motion.div>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Login Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You need to be logged in to interact with listings. Join SwapKr
              to contact sellers, make requests, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
              onClick={() => navigate("/login")}
            >
              Login / Sign Up
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowLoginPrompt(false)}
            >
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuestItemCard;
