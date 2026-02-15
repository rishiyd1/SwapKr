import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const chatMessages = [
  { from: "student", text: "bro add a bidding feature pls 🙏", time: "2m ago" },
  { from: "team", text: "already cooking it 🍳", time: "1m ago" },
  { from: "student", text: "sold my heater in 10 mins flat", time: "45s ago" },
  { from: "team", text: "that's the dream", time: "30s ago" },
];

const FeedbackSection = () => {
  const [message, setMessage] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-background" ref={ref}>
      {/* Cross-hatch pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="crossHatch"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="40" y2="40" stroke="hsl(42 100% 62%)" strokeWidth="0.5" />
              <line x1="40" y1="0" x2="0" y2="40" stroke="hsl(165 70% 45%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crossHatch)" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(ellipse, hsl(42 100% 62%) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-sm mb-4 text-center text-accent font-mono">
            {">"} channel: OPEN_COMMS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
            talk to <span className="text-primary glow-text">us</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            no support tickets. just a conversation.
          </p>
        </motion.div>

        <div
          className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6 relative overflow-hidden"
          style={{
            boxShadow: "0 0 20px hsl(42 100% 62% / 0.05)",
          }}
        >
          {/* Corner bracket accents */}
          <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t border-l border-primary/20" />
          <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t border-r border-primary/20" />
          <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b border-l border-accent/20" />
          <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b border-r border-accent/20" />

          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.from === "team" ? "justify-start" : "justify-end"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 }}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === "team"
                    ? "bg-secondary text-foreground rounded-bl-md"
                    : "bg-primary/15 text-foreground rounded-br-md"
                  }`}
                style={{
                  boxShadow:
                    msg.from === "team"
                      ? "0 0 10px hsl(165 70% 45% / 0.05)"
                      : "0 0 10px hsl(42 100% 62% / 0.08)",
                }}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
              </div>
            </motion.div>
          ))}

          {/* Blinking cursor indicator */}
          <motion.div
            className="text-xs font-mono text-primary/50 pt-2"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {">"} awaiting_input_
          </motion.div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="say something nice (or roast us)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            style={{
              boxShadow: "inset 0 0 10px hsl(42 100% 62% / 0.03)",
            }}
          />
          <Button
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 w-12 shrink-0 glow-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(42 100% 62% / 0.3) 50%, transparent 100%)",
        }}
      />
    </section>
  );
};

export default FeedbackSection;
