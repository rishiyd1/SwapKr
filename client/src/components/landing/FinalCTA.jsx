import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const FinalCTA = ({ onStart }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-background" ref={ref}>
      {/* Concentric rings pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="concentricRings"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="60" cy="60" r="20" fill="none" stroke="hsl(42 100% 62%)" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="40" fill="none" stroke="hsl(42 100% 62%)" strokeWidth="0.3" />
              <circle cx="60" cy="60" r="55" fill="none" stroke="hsl(165 70% 45%)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#concentricRings)" />
        </svg>
      </div>

      {/* Large center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 60%)",
        }}
      />

      {/* Secondary accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, hsl(165 70% 45%) 0%, transparent 60%)",
        }}
      />

      {/* Pulsing ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/10"
        animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-accent/10"
        animate={{ scale: [1, 1.8, 1], opacity: [0.1, 0, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />

      <motion.div
        className="max-w-3xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="text-sm mb-6 text-primary font-mono">
          {">"} final_call: INITIALIZE
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
          Stop hoarding.{" "}
          <span className="text-primary glow-text">Start swapping.</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          your room will thank you
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display glow-primary px-10"
            onClick={onStart}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 text-foreground hover:bg-primary/10 font-display px-10"
          >
            Explore Listings
          </Button>
        </div>

        {/* Terminal output */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 p-3 rounded-lg bg-card border border-primary/20 font-mono text-xs text-primary inline-block"
        >
          <span>{">"} ready_to_swap: </span>
          <motion.span
            className="text-accent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TRUE
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(165 70% 45% / 0.3) 50%, transparent 100%)",
        }}
      />

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, hsl(42 100% 62%) 0%, hsl(165 70% 45%) 50%, hsl(42 100% 62%) 100%)",
          boxShadow: "0 0 20px hsl(42 100% 62% / 0.3)",
        }}
      />
    </section>
  );
};

export default FinalCTA;
