import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Calculator, Tag, Grid3X3, Zap } from "lucide-react";

const categories = [
  "Electronics",
  "Books",
  "Stationery",
  "Cycles",
  "Lab Coats",
  "Sports Gear",
];

const ListingScene = () => {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center relative overflow-hidden"
    >

      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_two: SMART_LISTING
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-foreground">Categorize.</span>{" "}
            <span className="text-accent">Organize.</span>{" "}
            <span className="text-primary glow-text">Optimize.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Listing card with animation */}
          <motion.div className="relative max-w-sm w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="p-5 rounded-xl relative overflow-hidden h-full flex flex-col justify-between"
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--accent))",
                boxShadow: "0 0 25px hsl(165 70% 45% / 0.1)",
              }}
            >
              {/* Animated corner accents */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 border-2 border-primary"
                  style={{
                    top: i < 2 ? -1 : undefined,
                    bottom: i >= 2 ? -1 : undefined,
                    left: i % 2 === 0 ? -1 : undefined,
                    right: i % 2 !== 0 ? -1 : undefined,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}

              {/* Image area */}
              <div className="w-full h-32 rounded-lg flex items-center justify-center mb-4 bg-background">
                <Calculator className="w-16 h-16 text-primary" />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs mb-1 text-primary font-mono">
                    ITEM_NAME
                  </div>
                  <div className="text-base text-foreground font-display font-semibold">
                    Scientific Calculator
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-xs mb-1 text-accent font-mono">
                      CATEGORY
                    </div>
                    <div className="text-xs px-2 py-1 rounded inline-block border border-accent/50 bg-accent/10 text-accent">
                      Electronics
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1 text-primary font-mono">
                      PRICE
                    </div>
                    <div className="text-lg text-primary font-display font-bold">
                      ₹250
                    </div>
                  </div>
              </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Categories grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Grid3X3 className="w-6 h-6 text-primary" />
                <span className="text-xl text-primary font-display font-semibold">
                  Smart Categories
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-lg text-center cursor-pointer bg-card border border-primary/20 text-foreground font-body font-medium hover:border-primary/50 transition-colors"
                  >
                    <Tag className="w-5 h-5 mx-auto mb-2 text-primary" />
                    {cat}
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ListingScene;
