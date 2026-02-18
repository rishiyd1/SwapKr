import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ItemCard from "@/components/home/ItemCard";

const listings = [
  {
    name: "Casio FX-991EX",
    price: "₹800",
    condition: "Good",
    hostel: "Hostel 7",
    time: "2h ago",
    emoji: "🧮",
  },
  {
    name: "Engineering Graphics Kit",
    price: "₹350",
    condition: "Like new",
    hostel: "Hostel 3",
    time: "5h ago",
    emoji: "📐",
  },
  {
    name: "Room Heater (Bajaj)",
    price: "₹600",
    condition: "Used",
    hostel: "Mega Boys",
    time: "1d ago",
    emoji: "🔥",
  },
  {
    name: "Lab Coat (M)",
    price: "₹150",
    condition: "Good",
    hostel: "Hostel 9",
    time: "3h ago",
    emoji: "🥼",
  },
  {
    name: 'Dell Monitor 22"',
    price: "₹4,500",
    condition: "Excellent",
    hostel: "Hostel 2",
    time: "6h ago",
    emoji: "🖥️",
  },
  {
    name: "Firefox Cycle",
    price: "₹2,000",
    condition: "Fair",
    hostel: "Mega Girls",
    time: "12h ago",
    emoji: "🚲",
  },
];

const ListingsShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
          {listings.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="max-w-[300px] w-full mx-auto"
            >
              <ItemCard
                title={item.name}
                price={item.price}
                condition={item.condition}
                location={item.hostel}
                time={item.time}
                image={item.emoji}
                description="Listed just now"
                className="h-full bg-card/50 backdrop-blur-sm hover:shadow-[0_0_40px_hsl(165_70%_45%_/_0.15)] hover:border-accent/50 transition-all duration-300"
              />
            </motion.div>
          ))}
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
