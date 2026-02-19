import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  User,
  Info,
  Loader2,
} from "lucide-react";
import { ordersService } from "@/services/orders.service";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Is this item still available?",
  "I'm interested! Can we discuss the swap?",
  "Can I get more details about the condition?",
  "I'd like to offer something in exchange for this.",
  "Check out my profile for potential swap items!",
];

const BuyRequestDialog = ({ isOpen, onOpenChange, item }) => {
  const navigate = useNavigate();
  const [selectedMessage, setSelectedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!item) return null;

  const handleSubmit = async () => {
    if (!selectedMessage) {
      toast.error("Please select a message to send");
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersService.sendBuyRequest(item.id, selectedMessage);
      setSuccess(true);
      toast.success("Request sent to seller!");
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setSelectedMessage("");
        navigate("/home");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden rounded-3xl">
        <div className="relative">
          {/* Header Decoration */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent -z-10" />

          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display font-bold">
                    Contact Seller
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Send a quick request to start the conversation
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Request Sent!</h3>
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Wait for {item.seller?.name || "the seller"} to accept your
                  request to start chatting.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Item Summary */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-white/5">
                  <div className="w-16 h-16 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={
                          Array.isArray(item.image) ? item.image[0] : item.image
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">
                      {item.title}
                    </div>
                    <div className="text-primary font-bold text-sm">
                      ₹{item.price}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      Seller: {item.seller?.name || "Verified User"}
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Select a message
                  </div>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((msg) => (
                      <button
                        key={msg}
                        onClick={() => setSelectedMessage(msg)}
                        className={`text-sm text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                          selectedMessage === msg
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "bg-background/50 border-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                      * Personal messaging is restricted until the seller
                      accepts your buy request to ensure quality swaps and
                      platform security.
                    </p>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedMessage}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Request
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyRequestDialog;
