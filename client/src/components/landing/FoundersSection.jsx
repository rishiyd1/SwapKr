import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Twitter, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const founders = [
  {
    name: "Kushagar",
    role: "Co-Founder",
    message: "Papa hun mai papa, sari duniya ka papa",
    avatar: "🧑‍💻",
    color: "bg-primary/20",
  },
  {
    name: "Rishi",
    role: "Co-Founder",
    message: "Vedu ne mere kaam kharab kar diye h",
    avatar: "🎨",
    color: "bg-accent/20",
  },
  {
    name: "Ashish",
    role: "Co-Founder",
    message: "mera bhot tej sar dukh rha h",
    avatar: "🚀",
    color: "bg-primary/20",
  },
  {
    name: "Vedu",
    role: "Unpaid intern",
    message: "asogoarngojanijognoadsddsn",
    avatar: "🧠",
    color: "bg-accent/20",
  },
];

const FounderCard = ({
  founder,
  index,
  isHovered,
  isOtherHovered,
  onHover,
  onLeave,
}) => {
  const [displayText, setDisplayText] = useState(founder.role);

  useEffect(() => {
    let timeout;
    if (isHovered) {
      let i = 0;
      setDisplayText(""); // Clear text to start typing
      const type = () => {
        if (i < founder.message.length) {
          setDisplayText(founder.message.substring(0, i + 1));
          i++;
          timeout = setTimeout(type, 50); // Typing speed
        }
      };
      timeout = setTimeout(type, 100); // Small delay before typing starts
    } else {
      setDisplayText(founder.role); // Reset immediately on leave
    }
    return () => clearTimeout(timeout);
  }, [isHovered, founder.message, founder.role]);

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors relative overflow-hidden group flex flex-col items-center justify-center cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{
        scale: isHovered ? 1.05 : isOtherHovered ? 0.95 : 1,
        filter: isOtherHovered ? "blur(2px)" : "blur(0px)",
        zIndex: isHovered ? 10 : 1,
      }}
      transition={{ duration: 0.3 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave} // Ensure leave is handled here too for redundant safety
      style={{
        boxShadow: "0 0 15px hsl(42 100% 62% / 0.03)",
      }}
      whileHover={{
        boxShadow:
          index % 2 === 0
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
          background:
            "linear-gradient(45deg, transparent 30%, hsl(42 100% 62% / 0.04) 50%, transparent 70%)",
        }}
      />

      <div
        className={`w-16 h-16 rounded-full ${founder.color} flex items-center justify-center text-3xl mx-auto mb-3 relative`}
      >
        {founder.avatar}
        {/* Subtle pulse ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border ${index % 2 === 0 ? "border-primary/20" : "border-accent/20"}`}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
        />
      </div>
      <h3 className="font-display font-semibold text-foreground">
        {founder.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 font-mono h-5 flex items-center justify-center">
        {/* h-5 to prevent layout shift */}
        {displayText}
        {isHovered && <span className="animate-pulse">_</span>}
      </p>
      <div className="flex justify-center gap-3 mt-4">
        <Github className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
        <Linkedin className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
        <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
      </div>
    </motion.div>
  );
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
          timeout = setTimeout(() => {
            isDeleting = true;
            type();
          }, 2000);
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

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const user = authService.getCurrentUser();
      const payload = {
        name: user ? user.name : "Anonymous Visitor",
        email: user ? user.email : "",
        feedback: message,
      };

      await apiRequest("/api/feedback", "POST", payload);
      toast.success("Feedback sent! We'll read it, promise. 🫡");
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to send feedback. check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="about"
      className="py-24 px-6 relative overflow-hidden bg-background"
      ref={ref}
    >
      {/* Circuit-node pattern */}
      <div className="absolute inset-0 opacity-[0.12]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="foundersPattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <g
                fill="none"
                stroke="hsl(42 100% 62%)"
                strokeWidth="0.5"
                opacity="0.6"
              >
                <path d="M10 0v20M0 10h20" transform="translate(20, 20)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#foundersPattern)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.15]"
        style={{
          background:
            "radial-gradient(circle, hsl(42 100% 62%) 0%, transparent 70%)",
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

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {founders.map((f, i) => (
                <FounderCard
                  key={f.name}
                  founder={f}
                  index={i}
                  isHovered={hoveredIndex === i}
                  isOtherHovered={hoveredIndex !== null && hoveredIndex !== i}
                  onHover={() => setHoveredIndex(i)}
                  onLeave={() => setHoveredIndex(null)} // This might get overridden by parent onMouseLeave but good for specific card exit
                />
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
              className="bg-card border border-border rounded-xl p-4 space-y-2 mb-3 relative overflow-hidden w-full max-w-lg flex-1 flex flex-col"
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
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${
                      msg.from === "team"
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
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {msg.time}
                    </span>
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

            <div className="flex gap-2 w-full max-w-lg">
              <input
                type="text"
                placeholder={placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSubmit()
                }
                disabled={isLoading}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
                style={{
                  boxShadow: "inset 0 0 10px hsl(42 100% 62% / 0.03)",
                }}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={isLoading || !message.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10 w-10 shrink-0 glow-primary"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
export default FoundersSection;
