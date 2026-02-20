import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GuestItemCard from "@/components/products/GuestItemCard";
import { useItems } from "@/hooks/useItems";
import { formatTimeAgo } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ListingsShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const { data: items, isLoading } = useItems({});

  // Show the 6 most recent items
  const recentItems = (Array.isArray(items) ? items : items?.data || []).slice(0, 6);

  return (
    <section className="py-24 px-6 relative overflow-hidden" ref={ref}>
      {/* ... Background elements ... */}
      {/* Dot matrix background pattern */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="dotMatrixListings"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="hsl(42 100% 62%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotMatrixListings)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.15] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
          See what's already <span className="text-primary">moving</span> on
          campus
        </h2>
        <p className="text-center text-muted-foreground mb-14">
          real stuff, real prices, real close
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {recentItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="max-w-[240px] w-full mx-auto"
              >
                <GuestItemCard
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  category={item.category}
                  condition={item.condition}
                  time={formatTimeAgo(item.createdAt)}
                  image={
                    Array.isArray(item.images)
                      ? item.images.length > 0
                        ? item.images.map((img) => img.imageUrl)
                        : ["📦"]
                      : typeof item.images === "string"
                        ? JSON.parse(item.images)
                        : ["📦"]
                  }
                  className="h-full bg-card/50 backdrop-blur-sm hover:shadow-[0_0_40px_hsl(165_70%_45%_/_0.15)] hover:border-accent/50 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-3xl border border-white/5 border-dashed">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-display font-semibold mb-1">No listings yet</h3>
            <p className="text-muted-foreground text-sm">Be the first to list something!</p>
          </div>
        )}

        {/* Browse all link */}
        {recentItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link to="/products">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/30 text-primary hover:bg-primary/10 font-display px-10 rounded-full"
              >
                Browse all listings →
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(42 100% 62% / 0.4) 50%, transparent 100%)",
        }}
      />
    </section>
  );
};
export default ListingsShowcase;
