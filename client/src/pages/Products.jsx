import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Package, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useItems } from "@/hooks/useItems";
import GuestItemCard from "@/components/products/GuestItemCard";
import SwapkrLogo from "@/components/landing/SwapkrLogo";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";
import SpinnerLogo from "@/components/SpinnerLogo";

const CATEGORIES = [
  { id: "Hardware", label: "Hardware", icon: "⚙️" },
  { id: "Daily Use", label: "Daily Use", icon: "🧴" },
  { id: "Academics", label: "Academics", icon: "📚" },
  { id: "Sports", label: "Sports", icon: "⚽" },
  { id: "Others", label: "Others", icon: "📦" },
];

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: items, isLoading } = useItems({ category: selectedCategory });

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Guest Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 flex h-16 items-center justify-between">
          <Link to="/">
            <SwapkrLogo />
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-10 md:px-6 mx-auto max-w-7xl">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        ></motion.div>

        {/* Category Filters */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" /> Browse Categories
            </h2>
          </div>

          <div className="relative">
            {/* Scrollable Container */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x md:flex-wrap md:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory("All")}
                className={`relative px-6 py-3 rounded-full border flex items-center gap-2 transition-all duration-300 whitespace-nowrap snap-start ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-card/50 backdrop-blur-sm border-white/5 text-muted-foreground hover:bg-card hover:border-primary/20 hover:text-foreground"
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="font-semibold text-sm">All Items</span>
                {selectedCategory === "All" && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>

              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-6 py-3 rounded-full border flex items-center gap-2 transition-all duration-300 whitespace-nowrap snap-start ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                      : "bg-card/50 backdrop-blur-sm border-white/5 text-muted-foreground hover:bg-card hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  <span className="text-lg leading-none">{cat.icon}</span>
                  <span className="font-semibold text-sm">{cat.label}</span>
                  {selectedCategory === cat.id && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Gradient fade for horizontal scroll indication on mobile */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent md:hidden pointer-events-none" />
          </div>
        </div>

        {/* Listings Grid */}
        <div>
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-muted-foreground">
            Showing: <span className="text-foreground">{selectedCategory}</span>
          </h2>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <SpinnerLogo size={48} text="Loading items..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/5 bg-card/30 overflow-hidden animate-pulse"
                    >
                      <div className="h-48 bg-white/5" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                        <div className="h-10 bg-white/5 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : items?.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {(Array.isArray(items) ? items : items.data || []).map(
                  (item) => (
                    <GuestItemCard
                      key={item.id}
                      className="h-full"
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
                    />
                  ),
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground">
                  No items listed under{" "}
                  <span className="text-primary">{selectedCategory}</span> yet.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* CTA Banner */}
      <div className="border-t border-white/5 bg-primary/5">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-display font-bold mb-1">
              Ready to start swapping?
            </h3>
            <p className="text-muted-foreground text-sm">
              Join SwapKr to buy, sell, and swap items on your campus.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold gap-2 px-8 rounded-full"
          >
            <LogIn className="w-5 h-5" />
            Get Started
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
