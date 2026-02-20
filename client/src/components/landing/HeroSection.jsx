import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StudyTableSVG from "./StudyTableSVG";

const HeroSection = ({ onLogoActivate }) => {
  const [scanned, setScanned] = useState(false);
  const sectionRef = useRef(null);

  // Motion value to drive the scan line position (0 to 100 = percentage)
  const scanProgress = useMotionValue(0);
  const scanLeft = useTransform(scanProgress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    // Start scan line animation after a small delay to let page load
    const timeout = setTimeout(() => {
      const controls = animate(scanProgress, 100, {
        duration: 4.5,
        ease: "easeInOut",
        onUpdate: (v) => {
          // When scan line reaches the logo area (~6%), activate it
          if (v >= 6 && v < 100 && onLogoActivate) {
            onLogoActivate(true);
          }
          // After scan completes, deactivate
          if (v >= 100 && onLogoActivate) {
            onLogoActivate(false);
          }
          // When scan line reaches the table illustration (~70%), show message
          if (v >= 70 && !scanned) {
            setScanned(true);
          }
        },
      });
      return () => controls.stop();
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center pt-28 pb-16 px-6 relative overflow-hidden bg-background"
    >
      {/* Dot matrix background pattern */}
      <div className="absolute inset-0 opacity-[0.12]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="dotMatrix"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1.5" fill="hsl(42 100% 62%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotMatrix)" />
        </svg>
      </div>

      {/* Radial glow top-left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.14]"
        style={{
          background:
            "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 70%)",
        }}
      />

      {/* Radial glow bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.10]"
        style={{
          background:
            "radial-gradient(circle, hsl(165 70% 45%) 0%, transparent 70%)",
        }}
      />

      {/* Scanner line — moves once from left to right */}
      <motion.div
        className="absolute top-0 bottom-0 w-px z-20 pointer-events-none"
        style={{
          left: scanLeft,
          background:
            "linear-gradient(180deg, transparent 0%, hsl(42 100% 62% / 0.2) 30%, hsl(42 100% 62% / 0.35) 50%, hsl(42 100% 62% / 0.2) 70%, transparent 100%)",
          boxShadow: "0 0 6px hsl(42 100% 62% / 0.12)",
          opacity: useTransform(scanProgress, [0, 5, 90, 100], [0, 1, 1, 0]),
        }}
      />

      {/* Scanner glow trail — subtle horizontal glow that follows */}
      <motion.div
        className="absolute top-0 bottom-0 w-[40px] z-10 pointer-events-none"
        style={{
          left: scanLeft,
          background:
            "linear-gradient(90deg, hsl(42 100% 62% / 0.015) 0%, transparent 100%)",
          opacity: useTransform(
            scanProgress,
            [0, 5, 90, 100],
            [0, 0.7, 0.7, 0],
          ),
        }}
      />

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 relative z-10">
        {/* Left 62% */}
        <motion.div
          className="lg:w-[62%] w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
            Someone in campus needs{" "}
            <span className="text-primary glow-text">what you don't.</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-lg">
            what's lying around your room is useful to someone else
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-display glow-primary px-8"
              >
                Start swapping
              </Button>
            </Link>
            <Link to="/products" onClick={() => onLogoActivate(false)}>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary font-display px-8"
              >
                Browse Items
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right 38% — Table illustration */}
        <motion.div
          className="lg:w-[38%] w-full relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Scanner highlight overlay on table — appears when scan line passes */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={scanned ? { opacity: [0, 0.8, 0] } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, hsl(42 100% 62% / 0.08) 50%, transparent 100%)",
              boxShadow: scanned
                ? "inset 0 0 40px hsl(42 100% 62% / 0.05)"
                : "none",
            }}
          />

          <StudyTableSVG />

          {/* Message bubble — only appears AFTER scanner passes over the table */}
          <motion.div
            className="absolute -bottom-4 left-4 glass rounded-xl px-4 py-3 text-sm max-w-[220px]"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={
              scanned
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 15, scale: 0.9 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-3 h-3 rotate-45 glass absolute -top-1.5 left-8 border-t border-l border-border/50" />
            <span className="text-muted-foreground">
              need to clear this mess?{" "}
              <span className="text-primary font-semibold">we got you.</span>
            </span>
          </motion.div>
        </motion.div>
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

export default HeroSection;
