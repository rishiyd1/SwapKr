import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Package,
  MessageSquare,
  User,
  ShieldCheck,
  Loader2,
  Info,
  Zap,
  Trash2,
  MapPin,
} from "lucide-react";
import { useRequest, useDeleteRequest } from "@/hooks/useRequests";
import { chatsService } from "@/services/chats.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import NavbarHome from "@/components/home/NavbarHome";
import Footer from "@/components/landing/Footer";
import { formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";
import EditRequestDialog from "@/components/requests/EditRequestDialog";
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

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const currentUser = authService.getCurrentUser();
  const deleteRequestMutation = useDeleteRequest();

  const { data: request, isLoading, error } = useRequest(id);

  const { data: myConversations } = useQuery({
    queryKey: ["chats"],
    queryFn: chatsService.getMyConversations,
    enabled: !!currentUser,
  });

  const isOwner =
    currentUser && request && currentUser.id === request.requesterId;

  const existingChat =
    !isOwner &&
    myConversations?.find((c) => parseInt(c.requestId) === parseInt(id));

  const handleRequestUpdated = () => {
    queryClient.invalidateQueries(["request", id]);
  };

  const handleDeleteRequest = () => {
    deleteRequestMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-4xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">
          Request Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The request you are looking for might have been closed or removed by
          the user.
        </p>
        <Button
          onClick={() => navigate("/home?tab=requests")}
          variant="outline"
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Requests
        </Button>
      </div>
    );
  }

  const requester = request.requester || {};

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <NavbarHome />

      <main className="flex-1 container px-4 py-8 md:px-6 mx-auto max-w-4xl">
        {/* Back Navigation */}
        <Link
          to="/home?tab=requests"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-all mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to all requests
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden h-full flex flex-col"
            >
              {request.type === "Urgent" && (
                <div className="absolute top-0 right-0">
                  <div className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 fill-white" /> Urgent
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-primary font-display font-medium text-xs mb-4 uppercase tracking-[0.2em]">
                <Clock className="w-4 h-4" />
                Posted {formatTimeAgo(request.createdAt)}
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 leading-tight">
                {request.title}
              </h1>

              <div className="prose prose-invert max-w-none flex-1">
                <h3 className="text-sm font-display font-bold mb-3 flex items-center gap-2 text-foreground">
                  <Info className="w-4 h-4 text-primary" />
                  Request Details
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                <div className="flex items-center gap-2.5 bg-secondary/30 px-4 py-2 rounded-xl border border-white/5">
                  <Package
                    className={`w-4 h-4 ${request.type === "Urgent" ? "text-red-500" : "text-primary"}`}
                  />
                  <span className="text-sm font-medium">{request.status}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-secondary/30 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">
                    {request.category || "Others"}
                  </span>
                </div>
                {request.tokenCost > 0 && (
                  <div className="flex items-center gap-2.5 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                    <Zap className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm font-bold text-accent-foreground uppercase tracking-tight">
                      {request.tokenCost} Priority Tokens Used
                    </span>
                  </div>
                )}
                {request.budget && (
                  <div className="flex items-center gap-2.5 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                    <span className="text-sm font-bold text-green-500 uppercase tracking-tight">
                      Budget: ₹{request.budget}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Requester Info & Actions */}
          <div className="h-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-white/10 rounded-3xl p-6 shadow-xl h-full flex flex-col"
            >
              <h3 className="text-lg font-display font-bold mb-6">Requester</h3>
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-secondary/20 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-base truncate">
                    {requester.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-accent-foreground font-medium bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10 w-fit mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified User
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                  <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                      Location
                    </span>
                    <span className="font-medium text-foreground">
                      {requester.hostel || "Campus Location"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                  <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                      Department
                    </span>
                    <span className="font-medium text-foreground">
                      {requester.department || "Academic Dept"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                {isOwner ? (
                  <div className="grid grid-cols-2 gap-3">
                    <EditRequestDialog
                      request={request}
                      trigger={
                        <Button
                          variant="default"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                        >
                          Edit Request
                        </Button>
                      }
                      onRequestUpdated={handleRequestUpdated}
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
                  <>
                    {existingChat ? (
                      <Button
                        onClick={() =>
                          navigate(`/chats?chatId=${existingChat.id}`)
                        }
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-2xl font-display font-bold shadow-lg shadow-primary/10 group"
                      >
                        <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Continue Chat
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() =>
                            navigate(
                              `/chats?newChatWith=${requester.id}&requestId=${request.id}`,
                            )
                          }
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-2xl font-display font-bold shadow-lg shadow-primary/10 group"
                        >
                          <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                          I can provide this
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-4 px-4 italic">
                          By clicking, you'll start a chat with{" "}
                          {requester.name?.split(" ")[0]} to discuss the item.
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-card text-card-foreground border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              request and any associated chats.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-secondary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteRequest}
              disabled={deleteRequestMutation.isPending}
            >
              {deleteRequestMutation.isPending ? (
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

export default RequestDetail;
