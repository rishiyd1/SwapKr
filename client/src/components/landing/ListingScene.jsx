import { motion } from "framer-motion";
import { useRef } from "react";
import { Calculator, Tag, Grid3X3 } from "lucide-react";
import ItemCard from "@/components/home/ItemCard";

const categories = [
  "Electronics",
  "Books",
  "Stationery",
  "Cycles",
  "Lab Coats",
  "Sports Gear",
];

const ListingScene = () => {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center relative overflow-hidden"
    >
      <motion.div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-sm mb-4 text-primary font-mono">
            {">"} step_two: SMART_LISTING
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-foreground">Categorize.</span>{" "}
            <span className="text-accent">Organize.</span>{" "}
            <span className="text-primary glow-text">Optimize.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Listing card with animation */}
          <motion.div className="relative max-w-[320px] w-full mx-auto md:mr-0">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ItemCard
                title="Scientific Calculator"
                price="250"
                category="Electronics"
                condition="Like New"
                image={<Calculator className="w-16 h-16 text-primary" />}
                className="h-full bg-card/50 backdrop-blur-sm shadow-[0_0_25px_hsl(165_70%_45%_/_0.1)] border-accent hover:shadow-[0_0_40px_hsl(165_70%_45%_/_0.2)]"
                time="Just now"
              />
            </motion.div>
          </motion.div>

          {/* Right: Categories grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Grid3X3 className="w-6 h-6 text-primary" />
                <span className="text-xl text-primary font-display font-semibold">
                  Smart Categories
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-4 h-32 flex flex-col items-center justify-center rounded-lg text-center cursor-pointer bg-card border border-primary/20 text-foreground font-body font-medium hover:border-primary/50 transition-colors"
                  >
                    <Tag className="w-5 h-5 mx-auto mb-2 text-primary" />
                    {cat}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ListingScene;
