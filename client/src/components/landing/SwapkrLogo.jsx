import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SwapkrLogo = ({ activated = false }) => {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered || activated;

  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-primary"
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <path
          d="M16 2C10 2 8 8 8 12C8 16 10 18 16 18C22 18 24 20 24 24C24 28 22 30 16 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 30C22 30 24 24 24 20C24 16 22 14 16 14C10 14 8 12 8 8C8 4 10 2 16 2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </motion.svg>

      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.span
            key="word"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-lg font-bold text-primary overflow-hidden whitespace-nowrap"
          >
            swapkr
          </motion.span>
        ) : (
          <motion.span
            key="short"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display text-lg font-bold text-primary"
          >
            S
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwapkrLogo;
