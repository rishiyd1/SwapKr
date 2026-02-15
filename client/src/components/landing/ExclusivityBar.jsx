import { Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ExclusivityBar = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = () => setHidden(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] w-full h-9 flex items-center justify-center glow-border bg-secondary/50 overflow-hidden transition-transform duration-300"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
      }}
    >
      {/* Animated sweep line */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(42 100% 62% / 0.06) 50%, transparent 100%)",
          width: "200%",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="flex items-center gap-2 text-xs tracking-widest uppercase cursor-default relative z-10"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-3.5 h-3.5 text-primary" />
        </motion.div>
        <span className="text-muted-foreground">Exclusively for NITJ students</span>
      </div>

      {showTooltip && (
        <div className="absolute top-full mt-2 px-3 py-1.5 rounded-md glass text-xs text-foreground z-50 animate-fade-in">
          Only @nitj.ac.in emails allowed
        </div>
      )}
    </div>
  );
};

export default ExclusivityBar;
