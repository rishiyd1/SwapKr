import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
const FinalCTA = ({ onStart }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (<section className="py-32 px-6 relative overflow-hidden" ref={ref}>
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="gridCTA"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(42 100% 62%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridCTA)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.15] pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 70%)",
        }}
      />

      <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6 }}>
        <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
          Stop hoarding.{" "}
          <span className="text-primary glow-text">Start swapping.</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          your room will thank you
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display glow-primary px-10" onClick={onStart}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-display px-10">
            Explore Listings
          </Button>
        </div>
      </motion.div>

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
export default FinalCTA;
