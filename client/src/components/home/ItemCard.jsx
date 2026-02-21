import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Clock, MessageSquare, Tag, ShieldCheck } from "lucide-react"; // Added ShieldCheck
import { Button } from "@/components/ui/button";
import BuyRequestDialog from "@/components/items/BuyRequestDialog";
import { useQuery } from "@tanstack/react-query"; // Added useQuery
import { ordersService } from "@/services/orders.service"; // Added ordersService
import { chatsService } from "@/services/chats.service"; // Added chatsService

/**
 * Reusable ItemCard component
 * @param {object} props
 * @param {string} props.id - ID of the item
 * @param {string} props.title - Title of the item
 * @param {string} props.price - Price of the item
 * @param {string} props.category - Category of the item
 * @param {string} props.time - Time ago
 * @param {string|React.ReactNode} props.image - Image URL or Icon/Emoji component
 * @param {string} props.condition - Condition tag (optional)
 * @param {object} props.seller - Seller information
 * @param {string} props.className - Additional classes
 */
const ItemCard = ({
  id,
  title,
  price,
  category,
  time,
  image,
  condition,
  seller,
  className = "",
  ...props
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleCardClick = () => {
    if (id) {
      window.open(`/item/${id}`);
    }
  };

  // --- Interaction State Logic ---
  const { data: myRequests } = useQuery({
    queryKey: ["myRequests"],
    queryFn: ordersService.getMyRequests,
  });

  const { data: myConversations } = useQuery({
    queryKey: ["chats"],
    queryFn: chatsService.getMyConversations,
  });

  const existingRequest = myRequests?.find(
    (r) =>
      r.itemId === id &&
      (r.status === "Pending" ||
        r.status === "Accepted" ||
        r.status === "Rejected"),
  );

  const existingChat = myConversations?.find((c) => c.itemId === id);

  const getButtonConfig = () => {
    if (existingChat) {
      return {
        text: "Continue Chat",
        icon: MessageSquare,
        onClick: (e) => {
          e.stopPropagation();
          window.open(`/chats?chatId=${existingChat.id}`, "_blank"); // Open chat in new tab or navigate
        },
        disabled: false,
        variant: "default",
        className:
          "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent",
      };
    }

    if (existingRequest) {
      if (existingRequest.status === "Pending") {
        return {
          text: "Request Sent",
          icon: Clock,
          onClick: (e) => e.stopPropagation(),
          disabled: true,
          variant: "secondary",
          className:
            "bg-secondary text-secondary-foreground border-transparent",
        };
      }
      if (existingRequest.status === "Rejected") {
        return {
          text: "Request Denied",
          icon: ShieldCheck,
          onClick: (e) => e.stopPropagation(),
          disabled: true,
          variant: "destructive",
          className:
            "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
        };
      }
      if (existingRequest.status === "Accepted") {
        return {
          text: "Continue Chat",
          icon: MessageSquare,
          onClick: (e) => {
            e.stopPropagation();
            window.open(`/chats`, "_blank");
          },
          disabled: false,
          variant: "default",
          className:
            "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent",
        };
      }
    }

    return {
      text: "Contact Seller",
      icon: MessageSquare,
      onClick: (e) => {
        e.stopPropagation();
        setIsDialogOpen(true);
      },
      disabled: false,
      variant: "outline",
      className:
        "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-primary/20 hover:border-primary",
    };
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

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
        <div className="aspect-[4/5] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0.8, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.8, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              {/* Image rendering logic... */}
              {typeof currentImage === "string" &&
              currentImage.startsWith("http") ? (
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

          {/* Condition Tag on Top Right */}
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
        </div>

        {/* Content Section */}
        <div className="p-4 relative z-10 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <span className="text-primary font-bold text-lg whitespace-nowrap ml-2">
                ₹{price}
              </span>
            </div>

            {/* Category & Time */}
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

          {/* Dynamic Action Button */}
          <Button
            className={`w-full transition-all duration-300 h-10 gap-2 font-display text-xs sm:text-sm font-semibold group/btn mt-auto ${buttonConfig.className}`}
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled}
            variant={
              buttonConfig.variant === "destructive" ? "destructive" : "outline"
            } // Handle variant prop for destructive/secondary
          >
            <ButtonIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            {buttonConfig.text}
          </Button>
        </div>
      </motion.div>

      <BuyRequestDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={{ id, title, price, category, image, seller }}
      />
    </>
  );
};

export default ItemCard;
