import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Calculator, MapPin, Users, ArrowRight, Shield } from "lucide-react";

const BuyerScene = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-24"
    >

      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12"
      >
        {/* Header Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_three: SECURE_EXCHANGE
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-8">
            <span className="text-foreground">Meet.</span>{" "}
            <span className="text-accent">Verify.</span>{" "}
            <span className="text-primary glow-text">Exchange.</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto mt-6 text-muted-foreground">
            Two students. Same campus. Secure handoff.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-24 items-center mb-16">
          {/* Seller */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
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
          </motion.div>

            {/* Item Transfer Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <motion.div
                className="p-8 rounded-xl relative overflow-hidden bg-card mx-auto w-40"
                style={{
                  border: "2px solid hsl(var(--accent))",
                  boxShadow: "0 0 40px hsl(165 70% 45% / 0.25)",
                }}
                animate={isInView ? {
                  x: isDesktop ? ["-280%", "-280%", "0%", "0%", "280%", "280%"] : 0,
                  y: isDesktop ? 0 : ["-180%", "-180%", "0%", "0%", "180%", "180%"],
                } : {}}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  fill: "forwards"
                }}
              >
                <Calculator className="w-24 h-24 mx-auto text-accent" />
              </motion.div>

              {/* Status Labels - Synchronized with movement */}
              <div className="relative mt-8 h-8 flex justify-center w-40 mx-auto">
                {/* Listed (Start) */}
                <motion.div
                  className="absolute px-4 py-1 rounded-lg whitespace-nowrap font-mono text-sm md:text-base font-bold"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 15px hsl(42 100% 62% / 0.4)",
                    left: "50%",
                    top: "0",
                    transform: "translateX(-50%)"
                  }}
                  animate={isInView ? { opacity: [1, 1, 0, 0, 0, 0] } : { opacity: 0 }}
                  transition={{
                    duration: 8,
                    times: [0, 0.2, 0.25, 0.8, 0.9, 1],
                    fill: "forwards"
                  }}
                >
                  ITEM LISTED
                </motion.div>

                {/* Transit (Center) */}
                <motion.div
                  className="absolute px-4 py-1 rounded-lg whitespace-nowrap font-mono text-sm md:text-base font-bold"
                  style={{
                    backgroundColor: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                    boxShadow: "0 0 15px hsl(165 70% 45% / 0.4)",
                    left: "50%",
                    top: "0",
                    transform: "translateX(-50%)"
                  }}
                  animate={isInView ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
                  transition={{
                    duration: 8,
                    times: [0, 0.42, 0.48, 0.6, 0.65, 1], // Delay start until 0.42 (after stop at 0.4)
                    fill: "forwards"
                  }}
                >
                  ITEM IN TRANSIT
                </motion.div>

                {/* Sold (End) */}
                <motion.div
                  className="absolute px-4 py-1 rounded-lg whitespace-nowrap font-mono text-sm md:text-base font-bold"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 15px hsl(42 100% 62% / 0.4)",
                    left: "50%",
                    top: "0",
                    transform: "translateX(-50%)"
                  }}
                  animate={isInView ? { opacity: [0, 0, 0, 0, 1, 1] } : { opacity: 0 }}
                  transition={{
                    duration: 8,
                    times: [0, 0.2, 0.4, 0.82, 0.88, 1], // Delay start until 0.82 (after stop at 0.8)
                    fill: "forwards"
                  }}
                >
                  ITEM SOLD
                </motion.div>
              </div>
            </motion.div>

          {/* Buyer */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
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
          </motion.div>
        </div>

        {/* Stickers */}
        {[
          { text: "Verified Students", bgColor: "hsl(var(--accent))", textColor: "hsl(var(--accent-foreground))", rotate: -6, top: "15%", left: "5%" }, 
          { text: "Campus Location", bgColor: "hsl(var(--accent))", textColor: "hsl(var(--accent-foreground))", rotate: 6, bottom: "20%", left: "5%" },
          { text: "Secure Exchange", bgColor: "hsl(var(--primary))", textColor: "hsl(var(--primary-foreground))", rotate: -3, top: "20%", right: "8%" },
          { text: "Direct Handoff", bgColor: "hsl(var(--primary))", textColor: "hsl(var(--primary-foreground))", rotate: 5, bottom: "10%", right: "10%" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotate: s.rotate }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 + i * 0.2 }}
            viewport={{ once: true }}
            className="absolute hidden md:flex items-center justify-center px-4 py-2 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display font-bold text-lg z-20 pointer-events-none"
            style={{
              backgroundColor: s.bgColor,
              color: s.textColor,
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
            }}
          >
            {s.text}
          </motion.div>
        ))}
      </motion.div>

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

export default BuyerScene;
