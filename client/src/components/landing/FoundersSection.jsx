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
    return (<section className="py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          built because our rooms were{" "}
          <span className="text-primary">full</span>
        </h2>
        <p className="text-muted-foreground mb-14">
          four students, one messy hostel room, and an idea
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {founders.map((f, i) => (<motion.div key={f.name} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors" initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <div className={`w-16 h-16 rounded-full ${f.color} flex items-center justify-center text-3xl mx-auto mb-4`}>
                {f.avatar}
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
              <div className="flex justify-center gap-3 mt-4">
                <Github className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"/>
                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"/>
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"/>
              </div>
            </motion.div>))}
        </div>
      </div>
    </section>);
};
export default FoundersSection;
