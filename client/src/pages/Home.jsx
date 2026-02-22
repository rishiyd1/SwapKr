import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavbarHome from "@/components/home/NavbarHome";
import ItemCard from "@/components/home/ItemCard";
import CreateItemDialog from "@/components/items/CreateItemDialog";
import CreateRequestDialog from "@/components/requests/CreateRequestDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Loader2,
  Zap,
  Clock,
  PlusCircle,
  ShoppingBag,
  Hand,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useItems } from "@/hooks/useItems";
import { useRequests } from "@/hooks/useRequests";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";

const CATEGORIES = [
  { id: "Hardware", label: "Hardware", icon: "⚙️" },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) {
        setScrolled(window.scrollY > 60);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handler);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  useEffect(() => {
    if (urlTab === "requests") {
      setActiveTab("requests");
    } else if (urlTab === "listings") {
      setActiveTab("listings");
    }
  }, [urlTab]);

  /* 
    REFACTOR: Replaced manual useQuery with custom hooks
    - useItems encapsulates item fetching logic
    - useRequests encapsulates request fetching logic
  */

  // Get search query from URL
  const searchQuery = searchParams.get("search") || "";

  const handleSearchChange = (query) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (query) {
        newParams.set("search", query);
      } else {
        newParams.delete("search");
      }
      return newParams;
    });
  };

  const { data: items, isLoading: isLoadingItems } = useItems(
    { category: selectedCategory, search: searchQuery },
    activeTab === "listings",
  );

  const { data: requests, isLoading: isLoadingRequests } = useRequests(
    { category: selectedCategory },
    activeTab === "requests",
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <NavbarHome
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        hiddenOnMobile={scrolled}
      />

      <main className="flex-1 container px-4 pt-4 pb-8 md:px-6 mx-auto max-w-7xl">
        {/* Mobile Action Buttons (Visible only on mobile, below navbar) */}
        <div className="sm:hidden w-full h-10 mb-6 relative z-40">
          <div
            className={`flex gap-3 w-full transition-all duration-300 ${
              scrolled
                ? "fixed top-0 left-0 right-0 px-4 py-3 bg-background/90 backdrop-blur-xl shadow-sm border-b border-white/10"
                : "absolute top-0 left-0 right-0"
            }`}
          >
            <CreateRequestDialog
              trigger={
                <Button className="flex-1 bg-secondary/50 hover:bg-secondary border border-dashed border-primary/30 text-primary font-display gap-2 h-10 shadow-none">
                  <Hand className="h-4 w-4" /> Make Request
                </Button>
              }
            />
            <CreateItemDialog
              trigger={
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-display gap-2 h-10 shadow-none">
                  <PlusCircle className="h-4 w-4" /> Sell Item
                </Button>
              }
            />
          </div>
        </div>

        {/* Categories section was unified into the Showing dropdown */}

        {/* Tabs Header - Compact Segmented Control */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex p-1 bg-secondary/30 rounded-full border border-white/5 relative">
            <button
              onClick={() => handleTabChange("listings")}
              className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-display font-medium transition-all duration-300 relative z-10 ${
                activeTab === "listings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Item Listings
            </button>
            <button
              onClick={() => handleTabChange("requests")}
              className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-display font-medium transition-all duration-300 relative z-10 ${
                activeTab === "requests"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Item Requests
            </button>
          </div>
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
              {/* Listings Grid */}
              <div>
                <div className="flex items-center gap-2 mb-6 text-sm md:text-base text-muted-foreground font-body">
                  <span>Showing:</span>
                  <div>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-1 w-auto border-none bg-transparent shadow-none p-0 h-auto text-sm md:text-base text-foreground font-semibold focus:outline-none focus:ring-0 [&>svg]:ml-1 data-[state=open]:text-primary transition-colors hover:text-primary">
                        {selectedCategory}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-white/10 min-w-[8rem] z-50">
                        <DropdownMenuItem
                          onClick={() => setSelectedCategory("All")}
                          className="py-2 cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-foreground"
                        >
                          All
                        </DropdownMenuItem>
                        {CATEGORIES.map((cat) => (
                          <DropdownMenuItem
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="py-2 cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-foreground"
                          >
                            {cat.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

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
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                    Item Requests
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                    Browse what others are looking for or make your own request
                    to find items you need on campus.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <span>Showing:</span>
                  <div>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-1 w-auto border-none bg-transparent shadow-none p-0 h-auto text-sm md:text-base font-semibold text-foreground focus:outline-none focus:ring-0 [&>svg]:ml-1 data-[state=open]:text-primary transition-colors hover:text-primary">
                        {selectedCategory}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-white/10 min-w-[8rem] z-50">
                        <DropdownMenuItem
                          onClick={() => setSelectedCategory("All")}
                          className="py-2 cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-foreground"
                        >
                          All
                        </DropdownMenuItem>
                        {CATEGORIES.map((cat) => (
                          <DropdownMenuItem
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="py-2 cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-foreground"
                          >
                            {cat.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 ${
                            request.type === "Urgent"
                              ? "bg-red-500/10"
                              : "bg-primary/10"
                          }`}
                        >
                          {request.type === "Urgent" ? "🔥" : "✨"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-display font-bold group-hover:text-primary transition-colors pr-10 truncate">
                            {request.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-accent">
                              {request.category || "Others"}
                            </span>
                            <span>•</span>
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
                    No requests under{" "}
                    <span className="text-primary">{selectedCategory}</span>{" "}
                    yet.
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
