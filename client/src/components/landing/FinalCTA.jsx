import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* ... (background code remains same until Input Form div) ... */}
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="gridCTA"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridCTA)" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20">
        {/* Huge Background Text */}
        <div className="relative">
          <h1
            className="font-display font-bold text-[15vw] leading-none text-transparent tracking-tighter select-none opacity-20"
            style={{ WebkitTextStroke: "1px #333" }}
          >
            JOIN
          </h1>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <p className="font-mono text-accent text-sm sm:text-base tracking-[0.2em] uppercase mb-4">
              NITJ Exclusive
            </p>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center -mt-2 sm:-mt-16 relative z-20">
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight">
            Your campus.
          </h2>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight mt-2">
            Your market.
          </h2>
        </div>

        <p className="text-muted-foreground mt-8 text-center max-w-lg text-sm sm:text-base px-4">
          Join the exclusive marketplace for NIT Jalandhar students today.
        </p>

        {/* Input Form */}
        <div className="mt-10 w-full max-w-md relative flex flex-col sm:flex-row gap-2 items-center justify-center">
          <Input
            type="email"
            placeholder="rollno@nitj.ac.in"
            className="bg-secondary/50 border-white/10 h-12 text-lg text-center sm:text-left"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Link
            to={`/login?email=${encodeURIComponent(email)}&mode=signup`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-lg px-8 h-12 tracking-widest rounded-md glow-accent whitespace-nowrap">
              JOIN <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <p className="text-muted-foreground/30 text-xs mt-6 font-mono tracking-widest uppercase">
          No spam. Just students.
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
