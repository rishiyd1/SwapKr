import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StudyTableSVG from "./StudyTableSVG";
const HeroSection = ({ onStart }) => {
    return (<section className="min-h-screen flex items-center pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
        {/* Left 62% */}
        <motion.div className="lg:w-[62%] w-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Someone in campus needs{" "}
            <span className="text-primary glow-text">what you don't.</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-lg">
            what's lying around your room is useful to someone else
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display glow-primary px-8" onClick={onStart}>
              Start swapping
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary font-display px-8">
              Browse campus
            </Button>
          </div>
        </motion.div>

        {/* Right 38% */}
        <motion.div className="lg:w-[38%] w-full relative" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <StudyTableSVG />
          <motion.div className="absolute -bottom-4 left-4 glass rounded-xl px-4 py-3 text-sm max-w-[220px]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="w-3 h-3 rotate-45 glass absolute -top-1.5 left-8 border-t border-l border-border/50"/>
            <span className="text-muted-foreground">
              need to clear this mess?{" "}
              <span className="text-primary">we got you.</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>);
};
export default HeroSection;
