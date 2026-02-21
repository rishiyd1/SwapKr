import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

const SwapkrLogo = ({ activated = false }) => {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered || activated;
  const isMobile = useIsMobile();

  return (
    <div
      className="flex items-center justify-start cursor-pointer select-none"
      style={{ width: isMobile ? "auto" : "140px", marginLeft: "-8px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="flex items-center justify-center relative"
        animate={{
          x: expanded && !isMobile ? -24 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <motion.img
          src="/swapkr.svg"
          alt="SwapKr Logo"
          width="32"
          height="32"
          className="object-contain relative z-10"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="flex items-center overflow-hidden ml-1"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <span className="font-display text-[1.7rem] font-bold text-primary leading-none whitespace-nowrap pt-2">
                {"wapKr".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.08 + i * 0.05 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SwapkrLogo;
