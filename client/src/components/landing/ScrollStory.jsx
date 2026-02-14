import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Package, ListChecks, MapPin, CheckCircle2 } from "lucide-react";
const steps = [
    {
        icon: Package,
        title: "Declutter",
        desc: "that senior's calculator might save your internals",
        detail: "You decide to let go of stuff you don't need anymore.",
        color: "text-primary",
    },
    {
        icon: ListChecks,
        title: "List it",
        desc: "snap a pic, set a price, done",
        detail: "Your item goes live on campus in under 30 seconds.",
        color: "text-accent",
    },
    {
        icon: MapPin,
        title: "Match",
        desc: "someone 2 hostels away already wants it",
        detail: "Swapkr finds the right person, right on campus.",
        color: "text-primary",
    },
    {
        icon: CheckCircle2,
        title: "Done",
        desc: "meet, exchange, sorted",
        detail: "No shipping. No strangers. Just campus people.",
        color: "text-accent",
    },
];
const StoryStep = ({ step, index, }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    return (<motion.div ref={ref} className="relative flex gap-8 items-start" initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border ${step.color}`}>
          <step.icon className="w-5 h-5"/>
        </div>
        {index < steps.length - 1 && (<div className="w-px h-20 bg-gradient-to-b from-border to-transparent mt-2"/>)}
      </div>

      <div className="pb-16">
        <h3 className={`font-display text-xl font-semibold ${step.color}`}>
          {step.title}
        </h3>
        <p className="text-foreground mt-1">{step.desc}</p>
        <p className="text-muted-foreground text-sm mt-2">{step.detail}</p>
      </div>
    </motion.div>);
};
const ScrollStory = () => {
    return (<section className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
          How it <span className="text-primary">works</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16">
          one scroll, you'll get it
        </p>
        <div className="space-y-0">
          {steps.map((step, i) => (<StoryStep key={step.title} step={step} index={i}/>))}
        </div>
      </div>
    </section>);
};
export default ScrollStory;
