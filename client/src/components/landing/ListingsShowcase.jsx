import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, MapPin } from "lucide-react";
const listings = [
    { name: "Casio FX-991EX", price: "₹800", condition: "Good", hostel: "Hostel 7", time: "2h ago", emoji: "🧮" },
    { name: "Engineering Graphics Kit", price: "₹350", condition: "Like new", hostel: "Hostel 3", time: "5h ago", emoji: "📐" },
    { name: "Room Heater (Bajaj)", price: "₹600", condition: "Used", hostel: "Mega Boys", time: "1d ago", emoji: "🔥" },
    { name: "Lab Coat (M)", price: "₹150", condition: "Good", hostel: "Hostel 9", time: "3h ago", emoji: "🥼" },
    { name: 'Dell Monitor 22"', price: "₹4,500", condition: "Excellent", hostel: "Hostel 2", time: "6h ago", emoji: "🖥️" },
    { name: "Firefox Cycle", price: "₹2,000", condition: "Fair", hostel: "Mega Girls", time: "12h ago", emoji: "🚲" },
];
const ListingsShowcase = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (<section className="py-24 px-6 relative overflow-hidden" ref={ref}>
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
          background: "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
          See what's already{" "}
          <span className="text-primary">moving</span> on campus
        </h2>
        <p className="text-center text-muted-foreground mb-14">
          real stuff, real prices, real close
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item, i) => (
            <motion.div
              key={item.name}
              className="p-5 rounded-xl relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--accent))",
                boxShadow: "0 0 25px hsl(165 70% 45% / 0.1)",
              }}
              whileHover={{
                boxShadow: "0 0 40px hsl(165 70% 45% / 0.2)",
              }}
            >
              {/* Animated corner accents */}
              {[0, 1, 2, 3].map((ci) => (
                <motion.div
                  key={ci}
                  className="absolute w-3 h-3 border-2 border-primary"
                  style={{
                    top: ci < 2 ? -1 : undefined,
                    bottom: ci >= 2 ? -1 : undefined,
                    left: ci % 2 === 0 ? -1 : undefined,
                    right: ci % 2 !== 0 ? -1 : undefined,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: ci * 0.5,
                  }}
                />
              ))}

              {/* Image area */}
              <div className="w-full h-32 rounded-lg flex items-center justify-center text-4xl mb-4 bg-background">
                {item.emoji}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs mb-1 text-primary font-mono">
                    ITEM_NAME
                  </div>
                  <div className="text-base text-foreground font-display font-semibold">
                    {item.name}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-xs mb-1 text-accent font-mono">
                      CONDITION
                    </div>
                    <div className="text-xs px-2 py-1 rounded inline-block border border-accent/50 bg-accent/10 text-accent">
                      {item.condition}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1 text-primary font-mono">
                      PRICE
                    </div>
                    <div className="text-lg text-primary font-display font-bold">
                      {item.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3" />
                    {item.hostel}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                  <motion.span
                    className="text-accent font-mono flex items-center gap-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ● LIVE
                  </motion.span>
                </div>
              </div>
            </motion.div>))}
        </div>
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
