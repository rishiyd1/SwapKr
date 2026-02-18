import { motion } from "framer-motion";
import { useRef } from "react";
import { Calculator, Upload, TrendingUp } from "lucide-react";

const SellerScene = () => {
  const ref = useRef(null);



  return (
    <section
      id="how-it-works"
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center relative overflow-hidden"
    >
      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_one: LIST_IT
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-foreground">Got something?</span>{" "}
            <span className="text-primary glow-text">List it.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Calculator - static position */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-full flex flex-col items-center justify-center p-8"
              animate={{
                // No shadow animation anymore
              }}
              transition={{
                opacity: { duration: 0.8 },
                y: { duration: 0.8 },
              }}
            >
              <Calculator className="w-48 h-48 mx-auto text-primary" />


              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  ITEM DETECTED
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl font-display font-bold text-foreground"
                >
                  Scientific Calculator
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right: Seller info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
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
        </div>
      </motion.div>
    </section>
  );
};

export default SellerScene;
