import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavbarHome from "@/components/home/NavbarHome";
import ItemCard from "@/components/home/ItemCard";
import { Button } from "@/components/ui/button";
import { Filter, Package, HelpCircle, Loader2, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "@/services/items.service";
import { requestsService } from "@/services/requests.service";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";
import CreateRequestDialog from "@/components/requests/CreateRequestDialog";

const CATEGORIES = [
  { id: "Equipments", label: "Hardware", icon: "⚙️" },
  { id: "Daily Use", label: "Daily Use", icon: "🧴" },
  { id: "Academics", label: "Academics", icon: "📚" },
  { id: "Sports", label: "Sports", icon: "⚽" },
  { id: "Others", label: "Others", icon: "📦" },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    urlTab === "requests" ? "requests" : "listings",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (urlTab === "requests") {
      setActiveTab("requests");
    } else if (urlTab === "listings") {
      setActiveTab("listings");
    }
  }, [urlTab]);

  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ["items", selectedCategory],
    queryFn: () => itemsService.getItems({ category: selectedCategory }),
    enabled: activeTab === "listings",
  });

  const { data: requests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsService.getRequests,
    enabled: activeTab === "requests",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <NavbarHome />

      <main className="flex-1 container px-4 py-8 md:px-6 mx-auto max-w-7xl">
        {/* Tabs Header */}
        <div className="flex items-center justify-center mb-10 gap-4">
          <button
            onClick={() => handleTabChange("listings")}
            className={`px-8 py-3 rounded-full text-lg font-display font-medium transition-all duration-300 ${
              activeTab === "listings"
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(42_100%_62%_/_0.3)] scale-105"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            Item Listings
          </button>
          <button
            onClick={() => handleTabChange("requests")}
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

                {isLoadingItems ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : items?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(Array.isArray(items) ? items : items.data || []).map(
                      (item) => (
                        <ItemCard
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
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 p-8 rounded-3xl border border-white/5 shadow-xl">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-2">
                    Item Requests
                  </h2>
                  <p className="text-muted-foreground max-w-xl">
                    Browse what others are looking for or make your own request
                    to find items you need on campus.
                  </p>
                </div>
                <CreateRequestDialog
                  trigger={
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full font-display h-auto">
                      <HelpCircle className="w-5 h-5 mr-2" /> Make a Request
                    </Button>
                  }
                />
              </div>

              {isLoadingRequests ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : requests?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="group bg-card border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5 relative overflow-hidden cursor-pointer h-full flex flex-col"
                      onClick={() => navigate(`/request/${request.id}`)}
                    >
                      {request.type === "Urgent" && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-tighter">
                            <Zap className="w-3 h-3 fill-white" /> Urgent
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 flex-1 items-center">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 ${request.type === "Urgent" ? "bg-red-500/10" : "bg-primary/10"}`}
                        >
                          {request.type === "Urgent" ? "🔥" : "✨"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-display font-bold group-hover:text-primary transition-colors pr-10 truncate">
                            {request.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(request.createdAt)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-white/5 border-dashed">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-display font-semibold mb-2">
                    No requests found
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first one to make a request!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
