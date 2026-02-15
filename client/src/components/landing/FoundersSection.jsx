import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const founders = [
    { name: "Arjun", role: "the builder", avatar: "🧑‍💻", color: "bg-primary/20" },
    { name: "Priya", role: "the designer", avatar: "🎨", color: "bg-accent/20" },
    { name: "Rahul", role: "the hustler", avatar: "🚀", color: "bg-primary/20" },
    { name: "Sneha", role: "the thinker", avatar: "🧠", color: "bg-accent/20" },
];

const chatMessages = [
  { from: "student", text: "bro add a bidding feature pls 🙏", time: "2m ago" },
  { from: "team", text: "already cooking it 🍳", time: "1m ago" },
  { from: "student", text: "sold my heater in 10 mins flat", time: "45s ago" },
  { from: "team", text: "that's the dream", time: "30s ago" },
];

const placeholders = [
  "say something nice...",
  "or roast us...",
  "request a feature...",
  "report a bug...",
  "drop some feedback...",
  "tell us what you think...",
];

const FoundersSection = () => {
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const current = placeholders[phraseIndex];
      if (!isDeleting) {
        setPlaceholder(current.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === current.length) {
          timeout = setTimeout(() => { isDeleting = true; type(); }, 2000);
          return;
        }
        timeout = setTimeout(type, 60);
      } else {
        setPlaceholder(current.slice(0, charIndex));
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % placeholders.length;
          charIndex = 0;
          timeout = setTimeout(type, 400);
          return;
        }
        timeout = setTimeout(type, 30);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, []);

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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Two-column layout: Founders left, Feedback right */}
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          {/* Left: Founders */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="text-sm mb-4 text-accent font-mono">
                {">"} the_team: FOUNDERS
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                built because our rooms were{" "}
                <span className="text-primary glow-text">full</span>
              </h2>
              <p className="text-muted-foreground">
                four students, one messy hostel room, and an idea
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-5">
              {founders.map((f, i) => (
                <motion.div
                  key={f.name}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all relative overflow-hidden group flex flex-col items-center justify-center"
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

                  <div className={`w-16 h-16 rounded-full ${f.color} flex items-center justify-center text-3xl mx-auto mb-3 relative`}>
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

          {/* Right: Feedback chat */}
          <div className="flex flex-col items-center h-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="text-sm mb-4 text-accent font-mono">
                {">"} channel: OPEN_COMMS
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                talk to <span className="text-primary glow-text">us</span>
              </h2>
              <p className="text-muted-foreground">
                no support tickets. just a conversation.
              </p>
            </motion.div>

            <div
              className="bg-card border border-border rounded-xl p-4 space-y-2 mb-3 relative overflow-hidden max-w-md flex-1 flex flex-col"
              style={{
                boxShadow: "0 0 20px hsl(42 100% 62% / 0.05)",
              }}
            >
              {/* Corner bracket accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/20" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/20" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-accent/20" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-accent/20" />

              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.from === "team" ? "justify-start" : "justify-end"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.12 }}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${msg.from === "team"
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
                className="text-[10px] font-mono text-primary/50 pt-1"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {">"} awaiting_input_
              </motion.div>
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder={placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                style={{
                  boxShadow: "inset 0 0 10px hsl(42 100% 62% / 0.03)",
                }}
              />
              <Button
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10 w-10 shrink-0 glow-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
export default FoundersSection;
