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

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-background" ref={ref}>
      {/* Diamond / rotated grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="diamondGrid"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="60" y2="0" stroke="hsl(42 100% 62%)" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="60" stroke="hsl(42 100% 62%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamondGrid)" />
        </svg>
      </div>

      {/* Ambient glow orbs */}
      <div
        className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-20 left-10 w-[350px] h-[350px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, hsl(165 70% 45%) 0%, transparent 70%)",
        }}
      />

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px opacity-10"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(165 70% 45%) 50%, transparent 100%)",
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-sm mb-4 text-center text-primary font-mono">
            {">"} live_feed: CAMPUS_LISTINGS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
            See what's already{" "}
            <span className="text-primary glow-text">moving</span> on campus
          </h2>
          <p className="text-center text-muted-foreground mb-14">
            real stuff, real prices, real close
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item, i) => (
            <motion.div
              key={item.name}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group cursor-pointer relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                boxShadow: "0 0 15px hsl(42 100% 62% / 0.05)",
              }}
              whileHover={{
                boxShadow: "0 0 25px hsl(42 100% 62% / 0.15)",
                borderColor: "hsl(42 100% 62% / 0.3)",
              }}
            >
              {/* Corner accent dots */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/30" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-accent/30" />

              <div className="w-full h-32 bg-secondary rounded-lg flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform relative overflow-hidden">
                {item.emoji}
                {/* Holographic sweep on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(45deg, transparent 30%, hsl(42 100% 62% / 0.06) 50%, transparent 70%)",
                  }}
                />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                  <span className="text-xs text-muted-foreground mt-1 inline-block px-2 py-0.5 rounded-full bg-secondary border border-border/50">
                    {item.condition}
                  </span>
                </div>
                <span className="font-display text-lg font-bold text-primary">{item.price}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.hostel}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Terminal status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 p-3 rounded-lg bg-card border border-primary/20 font-mono text-xs text-primary flex items-center justify-center gap-6"
        >
          <span>{">"} active_listings: 6</span>
          <span className="text-accent">{">"} status: LIVE</span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ● STREAMING
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
};

export default ListingsShowcase;
