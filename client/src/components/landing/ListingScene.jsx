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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const calcX = useTransform(scrollYProgress, [0, 0.5], [-200, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 1]);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
    >
      {/* Hexagon pattern background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="50"
              height="43.4"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43"
                fill="none"
                stroke="hsl(42 100% 62%)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_two: SMART_LISTING
          </div>

          <h2 className="font-display text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">Categorize.</span>
            <br />
            <span className="text-accent">Organize.</span>
            <br />
            <span className="text-primary glow-text">Optimize.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Listing card with animation */}
          <motion.div style={{ x: calcX }} className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl relative overflow-hidden"
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--accent))",
                boxShadow: "0 0 40px hsl(165 70% 45% / 0.2)",
              }}
            >
              {/* Animated corner accents */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 border-2 border-primary"
                  style={{
                    top: i < 2 ? -2 : undefined,
                    bottom: i >= 2 ? -2 : undefined,
                    left: i % 2 === 0 ? -2 : undefined,
                    right: i % 2 !== 0 ? -2 : undefined,
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
              <div className="w-full h-48 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden bg-background">
                <Calculator className="w-20 h-20 text-primary" />

                {/* Scan effect */}
                <motion.div
                  className="absolute inset-x-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, hsl(42 100% 62% / 0.15) 50%, transparent 100%)",
                    height: "2px",
                  }}
                  animate={{ y: [0, 192, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs mb-1 text-primary font-mono">
                    ITEM_NAME
                  </div>
                  <div className="text-lg text-foreground font-display font-semibold">
                    Scientific Calculator
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-xs mb-1 text-accent font-mono">
                      CATEGORY
                    </div>
                    <div className="text-sm px-2 py-1 rounded inline-block border border-accent/50 bg-accent/10 text-accent">
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display font-bold glow-primary"
                >
                  <Zap className="w-4 h-4" />
                  DEPLOY LISTING
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Categories grid */}
          <div className="space-y-6">
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

            {/* Stats terminal */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="p-4 rounded-lg bg-card border border-accent/30 font-mono text-sm"
            >
              <div className="text-primary">
                {">"} Auto-categorization: ENABLED
              </div>
              <div className="text-accent">
                {">"} Search indexing: REAL-TIME
              </div>
              <div className="text-primary">
                {">"} Discovery rate: OPTIMIZED
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ListingScene;
