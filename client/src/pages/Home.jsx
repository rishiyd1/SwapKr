import { useState } from "react";
import NavbarHome from "@/components/home/NavbarHome";
import ItemCard from "@/components/home/ItemCard";
import { Button } from "@/components/ui/button";
import { Filter, Package, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";

const CATEGORIES = [
  { id: "Equipments", label: "Hardware", icon: "⚙️" },
  { id: "Daily Use", label: "Daily Use", icon: "🧴" },
  { id: "Academics", label: "Academics", icon: "📚" },
  { id: "Sports", label: "Sports", icon: "⚽" },
  { id: "Others", label: "Others", icon: "📦" },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", selectedCategory],
    queryFn: () => itemsService.getItems({ category: selectedCategory }),
  });

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

                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : items?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Backend might return items wrapped in { success: true, count: N, data: [] } or just [] 
                        Adjusting to handle array directly or items.data 
                    */}
                    {(Array.isArray(items) ? items : items.data || []).map(
                      (item) => (
                        <ItemCard
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          price={item.price}
                          category={item.category}
                          time={formatTimeAgo(item.createdAt)}
                          image={
                            Array.isArray(item.images)
                              ? item.images.length > 0
                                ? item.images.map((img) => img.imageUrl)
                                : ["📦"]
                              : typeof item.images === "string"
                                ? JSON.parse(item.images)
                                : ["📦"]
                          }
                          condition={item.condition}
                          seller={item.seller}
                        />
                      ),
                    )}
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
      <Footer />
    </div>
  );
};

export default Home;
