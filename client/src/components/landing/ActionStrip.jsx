import { motion } from "framer-motion";

const words = ["sell", "exchange", "request", "buy", "bid", "rent", "trade", "borrow", "give away"];
const repeated = [...words, ...words, ...words, ...words];

const ActionStrip = () => (
  <section className="py-10 overflow-hidden relative bg-background">
    {/* Grid background */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(hsl(42 100% 62%) 1px, transparent 1px),
          linear-gradient(90deg, hsl(42 100% 62%) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />

    {/* Top glow line */}
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsl(42 100% 62% / 0.3) 30%, hsl(165 70% 45% / 0.3) 70%, transparent 100%)",
      }}
    />

    {/* Bottom glow line */}
    <div
      className="absolute bottom-0 left-0 right-0 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsl(165 70% 45% / 0.3) 30%, hsl(42 100% 62% / 0.3) 70%, transparent 100%)",
      }}
    />

    {/* Ambient glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full opacity-[0.04]"
      style={{
        background: "radial-gradient(ellipse, hsl(42 100% 62%) 0%, transparent 70%)",
      }}
    />

    <div className="marquee flex gap-8 whitespace-nowrap w-max relative z-10">
      {repeated.map((word, i) => (
        <span key={i} className="font-display text-2xl sm:text-3xl font-semibold text-muted-foreground/40 glow-text select-none">
          {word}
          <span className="mx-4 text-primary/30">•</span>
        </span>
      ))}
    </div>
  </section>
);

export default ActionStrip;
