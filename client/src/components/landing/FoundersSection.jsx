import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

const founders = [
  { name: "Arjun", role: "the builder", avatar: "🧑‍💻", color: "bg-primary/20" },
  { name: "Priya", role: "the designer", avatar: "🎨", color: "bg-accent/20" },
  { name: "Rahul", role: "the hustler", avatar: "🚀", color: "bg-primary/20" },
  { name: "Sneha", role: "the thinker", avatar: "🧠", color: "bg-accent/20" },
];

const FoundersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-background" ref={ref}>
      {/* Circuit-node pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="circuitNodes"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="40" cy="40" r="2" fill="hsl(165 70% 45%)" />
              <line x1="40" y1="40" x2="80" y2="40" stroke="hsl(165 70% 45%)" strokeWidth="0.5" />
              <line x1="40" y1="40" x2="40" y2="80" stroke="hsl(165 70% 45%)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="hsl(42 100% 62%)" />
              <line x1="0" y1="0" x2="40" y2="0" stroke="hsl(42 100% 62%)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuitNodes)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-sm mb-4 text-accent font-mono">
            {">"} the_team: FOUNDERS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            built because our rooms were{" "}
            <span className="text-primary glow-text">full</span>
          </h2>
          <p className="text-muted-foreground mb-14">
            four students, one messy hostel room, and an idea
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {founders.map((f, i) => (
            <motion.div
              key={f.name}
              className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{
                boxShadow: "0 0 15px hsl(42 100% 62% / 0.03)",
              }}
              whileHover={{
                boxShadow: i % 2 === 0
                  ? "0 0 25px hsl(42 100% 62% / 0.15)"
                  : "0 0 25px hsl(165 70% 45% / 0.15)",
              }}
            >
              {/* Corner bracket accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/20 rounded-tl-sm" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/20 rounded-tr-sm" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-accent/20 rounded-bl-sm" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-accent/20 rounded-br-sm" />

              {/* Holographic sweep */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "linear-gradient(45deg, transparent 30%, hsl(42 100% 62% / 0.04) 50%, transparent 70%)",
                }}
              />

              <div className={`w-16 h-16 rounded-full ${f.color} flex items-center justify-center text-3xl mx-auto mb-4 relative`}>
                {f.avatar}
                {/* Subtle pulse ring */}
                <motion.div
                  className={`absolute inset-0 rounded-full border ${i % 2 === 0 ? 'border-primary/20' : 'border-accent/20'}`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{f.role}</p>
              <div className="flex justify-center gap-3 mt-4">
                <Github className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(165 70% 45% / 0.3) 50%, transparent 100%)",
        }}
      />
    </section>
  );
};

export default FoundersSection;
