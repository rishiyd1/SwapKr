import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Calculator, MapPin, Users, ArrowRight, Shield } from "lucide-react";

const BuyerScene = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const calcX = useTransform(scrollYProgress, [0, 0.5], [0, 400]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 1]);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
    >
      {/* Circuit pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="2" fill="hsl(42 100% 62%)" />
              <line x1="50" y1="50" x2="100" y2="50" stroke="hsl(42 100% 62%)" strokeWidth="1" />
              <line x1="50" y1="50" x2="50" y2="0" stroke="hsl(42 100% 62%)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_three: SECURE_EXCHANGE
          </div>

          <h2 className="font-display text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">Meet.</span>
            <br />
            <span className="text-accent">Verify.</span>
            <br />
            <span className="text-primary glow-text">Exchange.</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto mt-6 text-muted-foreground">
            Two students. Same campus. Secure handoff.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-center mb-16">
          {/* Seller */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center relative bg-card"
              style={{
                border: "3px solid hsl(var(--primary))",
                boxShadow: "0 0 30px hsl(42 100% 62% / 0.25)",
              }}
              animate={{
                boxShadow: [
                  "0 0 30px hsl(42 100% 62% / 0.25)",
                  "0 0 50px hsl(42 100% 62% / 0.4)",
                  "0 0 30px hsl(42 100% 62% / 0.25)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-primary" />

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <div className="text-lg mb-1 font-display font-semibold text-foreground">
              SELLER
            </div>
            <div className="text-sm text-primary font-mono">
              Block A, Room 204
            </div>
          </motion.div>

          {/* Calculator moving right */}
          <motion.div style={{ x: calcX }} className="relative">
            <motion.div
              className="p-8 rounded-xl relative overflow-hidden bg-card"
              style={{
                border: "2px solid hsl(var(--accent))",
                boxShadow: "0 0 40px hsl(165 70% 45% / 0.25)",
              }}
            >
              <Calculator className="w-24 h-24 mx-auto text-accent" />

              {/* Transfer arrows */}
              <motion.div
                className="absolute top-1/2 -right-12 transform -translate-y-1/2"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 text-primary" />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-lg whitespace-nowrap font-mono text-xs font-semibold"
              style={{
                backgroundColor: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground))",
                boxShadow: "0 0 15px hsl(165 70% 45% / 0.4)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ITEM IN TRANSIT
            </motion.div>
          </motion.div>

          {/* Buyer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center relative bg-card"
              style={{
                border: "3px solid hsl(var(--accent))",
                boxShadow: "0 0 30px hsl(165 70% 45% / 0.25)",
              }}
              animate={{
                boxShadow: [
                  "0 0 30px hsl(165 70% 45% / 0.25)",
                  "0 0 50px hsl(165 70% 45% / 0.4)",
                  "0 0 30px hsl(165 70% 45% / 0.25)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <Users className="w-16 h-16 text-accent" />

              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-accent"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </motion.div>

            <div className="text-lg mb-1 font-display font-semibold text-foreground">
              BUYER
            </div>
            <div className="text-sm text-accent font-mono">
              Block C, Room 412
            </div>
          </motion.div>
        </div>

        {/* Meeting point */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div
            className="p-8 rounded-xl relative overflow-hidden bg-card"
            style={{
              border: "2px solid hsl(var(--primary))",
              boxShadow: "0 0 40px hsl(42 100% 62% / 0.15)",
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="text-2xl text-primary font-display font-bold">
                MEETING POINT
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              {[
                { icon: Shield, label: "Verified Students", color: "text-primary" },
                { icon: MapPin, label: "Campus Location", color: "text-accent" },
                { icon: Users, label: "Direct Handoff", color: "text-primary" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4"
                >
                  <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                  <div className="text-sm text-foreground">{feature.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Terminal output */}
            <div className="mt-6 p-4 rounded-lg font-mono text-xs bg-background border border-primary/30 text-primary">
              <div>{">"} Initiating secure handoff protocol...</div>
              <div>{">"} Location: Library Gate</div>
              <div>{">"} Status: READY</div>
              <motion.div
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {">"} _
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, hsl(42 100% 62%) 0%, hsl(165 70% 45%) 50%, hsl(42 100% 62%) 100%)",
          boxShadow: "0 0 20px hsl(42 100% 62% / 0.3)",
        }}
      />
    </section>
  );
};

export default BuyerScene;
