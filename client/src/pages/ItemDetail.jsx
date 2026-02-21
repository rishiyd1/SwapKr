import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  MessageSquare,
  User,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";
import { useItem, useDeleteItem } from "@/hooks/useItems";
import { ordersService } from "@/services/orders.service";
import { chatsService } from "@/services/chats.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import NavbarHome from "@/components/home/NavbarHome";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";
import BuyRequestDialog from "@/components/items/BuyRequestDialog";
import EditItemDialog from "@/components/items/EditItemDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const currentUser = authService.getCurrentUser();
  const deleteItemMutation = useDeleteItem();

  // 1. All Hooks First
  const { data: item, isLoading, error } = useItem(id);

  const { data: myRequests } = useQuery({
    queryKey: ["myRequests"],
    queryFn: ordersService.getMyRequests,
    enabled: !!currentUser, // Only fetch if logged in
  });

  const { data: myConversations } = useQuery({
    queryKey: ["chats"],
    queryFn: chatsService.getMyConversations,
    enabled: !!currentUser,
  });

  const isOwner = currentUser && item && currentUser.id === item.sellerId;

  // 2. Derived State (Only for non-owners)
  const existingRequest =
    !isOwner &&
    myRequests?.find(
      (r) =>
        r.itemId === id &&
        (r.status === "Pending" ||
          r.status === "Accepted" ||
          r.status === "Rejected"),
    );

  const existingChat =
    !isOwner && myConversations?.find((c) => c.itemId === id);

  // 3. Helper Functions
  const getButtonConfig = () => {
    if (isOwner) return null; // Handled separately

    if (existingChat) {
      return {
        text: "Continue Chat",
        icon: MessageSquare,
        onClick: () => navigate(`/chats?chatId=${existingChat.id}`),
        disabled: false,
        variant: "default",
      };
    }

    if (existingRequest) {
      if (existingRequest.status === "Pending") {
        return {
          text: "Request Sent",
          icon: Clock,
          onClick: () => {},
          disabled: true,
          variant: "secondary",
        };
      }
      if (existingRequest.status === "Rejected") {
        return {
          text: "Request Denied",
          icon: ShieldCheck,
          onClick: () => {},
          disabled: true,
          variant: "destructive",
        };
      }
      if (existingRequest.status === "Accepted") {
        return {
          text: "Continue Chat",
          icon: MessageSquare,
          onClick: () => navigate(`/chats`),
          disabled: false,
          variant: "default",
        };
      }
    }

    return {
      text: "Contact Seller",
      icon: MessageSquare,
      onClick: () => setIsDialogOpen(true),
      disabled: false,
      variant: "default",
    };
  };

  const buttonConfig = getButtonConfig();

  const handleItemUpdated = () => {
    queryClient.invalidateQueries(["item", id]);
  };

  const handleDeleteItem = () => {
    deleteItemMutation.mutate(id);
  };

  // 4. Loading / Error States
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-4xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Item Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The item you are looking for might have been sold or removed by the
          seller.
        </p>
        <Button
          onClick={() => navigate("/home")}
          variant="outline"
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const images = Array.isArray(item.images) ? item.images : [];
  const seller = item.seller || {};

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="h-screen bg-background flex flex-col font-body overflow-hidden">
      <NavbarHome />

      <main className="flex-1 container px-4 py-4 md:px-6 mx-auto max-w-5xl overflow-hidden flex flex-col">
        {/* Back Navigation */}
        <Link
          to="/home"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-all mb-4 group"
        >
          <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center mr-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          Back to browsing
        </Link>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
          {/* Left: Image Gallery */}
          <div className="flex flex-col min-h-0">
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-secondary/20 shadow-xl group mb-4 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex].imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">
                      📦
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <div className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-display font-bold text-[10px] shadow-lg shadow-primary/20">
                  {item.condition}
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 aspect-square rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      currentImageIndex === idx
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Item Details */}
          <div className="flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-primary font-display font-medium text-[10px] sm:text-xs mb-1 uppercase tracking-widest">
                  <Tag className="w-3 h-3" />
                  {item.category} • {formatTimeAgo(item.createdAt)}
                </div>
                <h1 className="text-xl md:text-2xl font-display font-bold mb-1">
                  {item.title}
                </h1>
                <div className="text-xl font-bold text-primary">
                  ₹{item.price}
                </div>
              </div>

              {/* Seller Info Card */}
              <div className="bg-card/40 border border-white/5 rounded-xl p-3 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      Seller
                    </div>
                    <div className="font-display font-bold text-sm">
                      {seller.name}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-accent-foreground font-medium bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
                    <MapPin className="w-3 h-3 text-primary" />
                    {seller.hostel || "Campus Location"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-display font-bold mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {item.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2 flex-shrink-0">
              {isOwner ? (
                <div className="grid grid-cols-2 gap-3">
                  <EditItemDialog
                    item={item}
                    trigger={
                      <Button
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                      >
                        Edit Listing
                      </Button>
                    }
                    onItemUpdated={handleItemUpdated}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={buttonConfig.onClick}
                  disabled={buttonConfig.disabled}
                  variant={
                    buttonConfig.variant === "destructive"
                      ? "destructive"
                      : "default"
                  }
                  className={`w-full h-10 rounded-xl font-display text-sm font-bold shadow-lg shadow-primary/10 group ${
                    buttonConfig.variant === "default"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : buttonConfig.variant === "secondary"
                        ? "bg-secondary text-secondary-foreground"
                        : "" // Destructive handled by variant prop
                  }`}
                >
                  <buttonConfig.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {buttonConfig.text}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <BuyRequestDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={{
          id: item.id,
          title: item.title,
          price: item.price,
          category: item.category,
          image: images.length > 0 ? images[0].imageUrl : null,
          seller: seller,
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-card text-card-foreground border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              listing and any associated chats/requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-secondary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemDetail;
