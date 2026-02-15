import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
const FinalCTA = ({ onStart }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    return (<section className="py-32 px-6" ref={ref}>
      <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6 }}>
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
