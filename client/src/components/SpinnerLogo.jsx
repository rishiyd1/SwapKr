import { motion } from "framer-motion";

const SpinnerLogo = ({ size = 48, text = "" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <motion.img
        src="/swapkr.svg"
        alt="Loading"
        width={size}
        height={size}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="drop-shadow-[0_0_12px_hsl(42,100%,62%,0.4)]"
      />
      {text && (
        <p className="text-muted-foreground text-sm font-mono tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default SpinnerLogo;
