import { useState } from "react";
import NavbarHome from "@/components/home/NavbarHome";
import ItemCard from "@/components/home/ItemCard";
import { Button } from "@/components/ui/button";
import { Filter, Package, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "Equipments", label: "Hardware", icon: "⚙️" },
  { id: "Daily Use", label: "Daily Use", icon: "🧴" },
  { id: "Academics", label: "Academics", icon: "📚" },
  { id: "Sports", label: "Sports", icon: "⚽" },
  { id: "Others", label: "Others", icon: "📦" },
];

const MOCK_ITEMS = [
  {
    id: 1,
    title: "Engineering Mathematics",
    price: "₹450",
    description: "Brand new condition, rarely used. 5th edition by H.K. Dass.",
    location: "Hostel 1",
    time: "2 hrs ago",
    image: ["📚", "📖", "📔"],
    condition: "New",
    category: "Academics",
  },
  {
    id: 2,
    title: "Badminton Racket",
    price: "₹800",
    description: "Yonex Muscle Power 29. String tension 24 lbs.",
    location: "Hostel 5",
    time: "5 hrs ago",
    image: ["🏸", "🎾", "🏆"],
    condition: "Good",
    category: "Sports",
  },
  {
    id: 3,
    title: "Scientific Calculator",
    price: "₹600",
    description: "Casio fx-991ES Plus. Works perfectly.",
    location: "Mega Boys",
    time: "1 day ago",
    image: ["🧮", "🔢", "📏"],
    condition: "Used",
    category: "Equipments",
  },
  {
    id: 4,
    title: "Electric Kettle",
    price: "₹500",
    description: "Prestige 1.5L. Heats water quickly.",
    location: "Hostel 9",
    time: "3 days ago",
    image: ["🫖", "☕", "🔌"],
    condition: "Fair",
    category: "Daily Use",
  },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? MOCK_ITEMS
      : MOCK_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <NavbarHome />

      <main className="flex-1 container px-4 py-8 md:px-6 mx-auto max-w-7xl">
        {/* Tabs Header */}
        <div className="flex items-center justify-center mb-10 gap-4">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-8 py-3 rounded-full text-lg font-display font-medium transition-all duration-300 ${
              activeTab === "listings"
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(42_100%_62%_/_0.3)] scale-105"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            Item Listings
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-8 py-3 rounded-full text-lg font-display font-medium transition-all duration-300 ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(42_100%_62%_/_0.3)] scale-105"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            Item Requests
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "listings" ? (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Buttons */}
              <div className="mb-12">
                <h2 className="text-2xl font-display font-bold mb-6 text-foreground flex items-center gap-2">
                  <Filter className="w-6 h-6 text-primary" /> Browse Categories
                </h2>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`h-24 px-8 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 min-w-[120px] ${
                      selectedCategory === "All"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-white/5 text-muted-foreground hover:border-primary/50 hover:bg-card/80"
                    }`}
                  >
                    <Package className="w-8 h-8" />
                    <span className="font-semibold">All Items</span>
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`h-24 px-8 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 min-w-[120px] ${
                        selectedCategory === cat.id
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-white/5 text-muted-foreground hover:border-primary/50 hover:bg-card/80"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Listings Grid */}
              <div>
                <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-muted-foreground">
                  Showing:{" "}
                  <span className="text-foreground">{selectedCategory}</span>
                </h2>
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        title={item.title}
                        price={item.price}
                        description={item.description}
                        location={item.location}
                        time={item.time}
                        image={item.image}
                        condition={item.condition}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-display font-semibold mb-2">
                      No items found
                    </h3>
                    <p className="text-muted-foreground">
                      No items listed under{" "}
                      <span className="text-primary">{selectedCategory}</span>{" "}
                      yet.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center py-32"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/30 mb-6 text-4xl">
                ✨
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">
                Item Requests
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Looking for something specific? Request it here and let others
                on campus help you find it.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full font-display">
                <HelpCircle className="w-5 h-5 mr-2" /> Make a Request
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
