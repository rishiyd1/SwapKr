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
    return (<section className="py-24 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
          See what's already{" "}
          <span className="text-primary">moving</span> on campus
        </h2>
        <p className="text-center text-muted-foreground mb-14">
          real stuff, real prices, real close
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item, i) => (<motion.div key={item.name} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <div className="w-full h-32 bg-secondary rounded-lg flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                {item.emoji}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                  <span className="text-xs text-muted-foreground mt-1 inline-block px-2 py-0.5 rounded-full bg-secondary">
                    {item.condition}
                  </span>
                </div>
                <span className="font-display text-lg font-bold text-primary">{item.price}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3"/>
                  {item.hostel}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3"/>
                  {item.time}
                </span>
              </div>
            </motion.div>))}
        </div>
      </div>
    </section>);
};
export default ListingsShowcase;
