import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";

/**
 * Reusable ItemCard component
 * @param {object} props
 * @param {string} props.title - Title of the item
 * @param {string} props.price - Price of the item
 * @param {string} props.description - Short description or condition
 * @param {string} props.location - Hostel/Location
 * @param {string} props.time - Time ago
 * @param {string|React.ReactNode} props.image - Image URL or Icon/Emoji component
 * @param {string} props.condition - Condition tag (optional)
 * @param {string} props.className - Additional classes
 */
const ItemCard = ({
  title,
  price,
  description,
  location,
  time,
  image,
  condition,
  className = "",
  ...props
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <motion.div
      className={`group relative bg-card border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Image Placeholder */}
      <div className="aspect-square bg-secondary/50 relative flex items-center justify-center text-4xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0.8, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            {typeof currentImage === "string" &&
            currentImage.startsWith("http") ? (
              <img
                src={currentImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground/20 font-display font-bold">
                {currentImage || "ITEM"}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {condition && (
          <div className="absolute top-2 right-2 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-background/80 backdrop-blur text-primary border border-primary/20 z-10">
            {condition}
          </div>
        )}

        {/* Scroll Indicator (Dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? "bg-primary" : "bg-white/20"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg truncate pr-2">{title}</h3>
          <span className="text-accent font-bold whitespace-nowrap">
            {price}
          </span>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {location}
            </span>
          )}
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {time}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
