import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Calculator, Upload, TrendingUp } from "lucide-react";

const SellerScene = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const calcX = useTransform(scrollYProgress, [0, 0.5], [-400, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 1]);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
    >
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--accent)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        style={{ opacity }}
        className="max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center"
      >
        {/* Left: Calculator coming from left */}
        <motion.div style={{ x: calcX }} className="relative">
          <motion.div
            className="relative p-12 rounded-xl"
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "2px solid hsl(var(--primary))",
              boxShadow: "0 0 30px hsl(42 100% 62% / 0.2), inset 0 0 20px hsl(42 100% 62% / 0.05)",
            }}
            animate={{
              boxShadow: [
                "0 0 30px hsl(42 100% 62% / 0.2), inset 0 0 20px hsl(42 100% 62% / 0.05)",
                "0 0 50px hsl(42 100% 62% / 0.35), inset 0 0 30px hsl(42 100% 62% / 0.1)",
                "0 0 30px hsl(42 100% 62% / 0.2), inset 0 0 20px hsl(42 100% 62% / 0.05)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Calculator className="w-32 h-32 mx-auto text-primary" />

            {/* Holographic sweep */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  "linear-gradient(45deg, transparent 30%, hsl(42 100% 62% / 0.08) 50%, transparent 70%)",
              }}
              animate={{ x: [-200, 200] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Tag */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="absolute -right-4 top-1/4 px-4 py-2 rounded-lg text-xs font-mono font-semibold"
            style={{
              backgroundColor: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground))",
              boxShadow: "0 0 15px hsl(165 70% 45% / 0.4)",
            }}
          >
            ITEM DETECTED
          </motion.div>
        </motion.div>

        {/* Right: Seller info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div>
            <motion.div className="text-sm mb-2 text-primary font-mono">
              {">"} step_one: LIST_IT
            </motion.div>

            <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-foreground">Got something?</span>
              <br />
              <span className="text-primary glow-text">List it.</span>
            </h2>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: Upload, text: "Upload in seconds", color: "primary" },
              { icon: TrendingUp, text: "Instant visibility on campus", color: "accent" },
              { icon: Calculator, text: "Set your price", color: "primary" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center gap-4 p-4 rounded-lg bg-card border ${
                  feature.color === "primary"
                    ? "border-primary/30"
                    : "border-accent/30"
                }`}
                style={{
                  boxShadow:
                    feature.color === "primary"
                      ? "0 0 10px hsl(42 100% 62% / 0.1)"
                      : "0 0 10px hsl(165 70% 45% / 0.1)",
                }}
              >
                <feature.icon
                  className={`w-6 h-6 ${
                    feature.color === "primary" ? "text-primary" : "text-accent"
                  }`}
                />
                <span className="text-lg text-foreground font-body">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Code snippet */}
          <div
            className="p-4 rounded-lg font-mono text-sm border"
            style={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--primary) / 0.3)",
              color: "hsl(var(--primary))",
            }}
          >
            <div>{"if (item.unused) {"}</div>
            <div className="ml-4">{"  item.post();"}</div>
            <div className="ml-4">
              {"  return "}
              <span className="text-accent">{"'PROFIT'"}</span>
              {";"}
            </div>
            <div>{"}"}</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SellerScene;
