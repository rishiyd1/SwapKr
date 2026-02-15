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
    return (<section className="py-24 px-6" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">
          talk to <span className="text-primary">us</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          no support tickets. just a conversation.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4 mb-6">
          {chatMessages.map((msg, i) => (<motion.div key={i} className={`flex ${msg.from === "team" ? "justify-start" : "justify-end"}`} initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === "team"
                ? "bg-secondary text-foreground rounded-bl-md"
                : "bg-primary/15 text-foreground rounded-br-md"}`}>
                <p>{msg.text}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
              </div>
            </motion.div>))}
        </div>

        <div className="flex gap-3">
          <input type="text" placeholder="say something nice (or roast us)..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"/>
          <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 w-12 shrink-0">
            <Send className="w-4 h-4"/>
          </Button>
        </div>
      </div>

    </section>
  );
};
export default FeedbackSection;
