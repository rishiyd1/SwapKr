import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Package,
  FileText,
  Zap,
  Check,
  Trash2,
  Loader2,
  ArrowLeft,
  Clock,
  User,
  Users,
  AlertTriangle,
  Mail,
  BookOpen,
  Phone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NavbarHome from "@/components/home/NavbarHome";
import Footer from "@/components/landing/Footer";
import { formatDistanceToNow } from "date-fns";
import {
  usePendingItems,
  usePendingRequests,
  useUrgentRequests,
  useApproveItem,
  useDeleteItemAdmin,
  useApproveRequest,
  useDeleteRequestAdmin,
  useDeleteUserAdmin,
  useAllUsers,
  useApproveUrgentRequest,
  useDeleteUrgentRequest,
  isAdminEmail,
} from "@/hooks/useAdmin";
import { authService } from "@/services/auth.service";
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

// ────────────────────────────── Tab Button ──────────────────────────────
const TabBtn = ({ active, icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count > 0 && (
      <span
        className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
          active
            ? "bg-white/20 text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ────────────────────────────── Item Card ───────────────────────────────
const PendingItemCard = ({
  item,
  onApprove,
  onDelete,
  isApproving,
  isDeleting,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="group bg-secondary/20 border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300"
  >
    <div className="flex gap-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-xl bg-secondary/50 overflow-hidden flex-shrink-0 border border-white/5">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground opacity-30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-foreground truncate">
          {item.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {item.description}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="text-primary font-bold text-sm">₹{item.price}</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/50 border border-white/5">
            {item.category}
          </span>
          {item.seller && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.seller.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => onApprove(item.id)}
          disabled={isApproving}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          {isApproving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" /> Approve
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </>
          )}
        </Button>
      </div>
    </div>
  </motion.div>
);

// ────────────────────────────── Request Card ────────────────────────────
const PendingRequestCard = ({
  request,
  onApprove,
  onDelete,
  isApproving,
  isDeleting,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="group bg-secondary/20 border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300"
  >
    <div className="flex gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 bg-primary/10`}
      >
        ✨
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-foreground truncate">
          {request.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {request.description}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {request.budget && (
            <span className="text-primary font-bold text-sm">
              Budget: ₹{request.budget}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-secondary/50 border border-white/5">
            {request.category}
          </span>
          {request.requester && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {request.requester.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => onApprove(request.id)}
          disabled={isApproving}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          {isApproving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" /> Approve
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(request.id)}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </>
          )}
        </Button>
      </div>
    </div>
  </motion.div>
);

// ────────────────────────────── Urgent Card ─────────────────────────────
const UrgentRequestCard = ({
  request,
  onApprove,
  onDeleteRequest,
  isApproving,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteUserMutation = useDeleteUserAdmin();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="group bg-secondary/20 border border-red-500/10 rounded-2xl p-5 hover:border-red-500/20 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0">
          <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 uppercase tracking-tighter">
            <Zap className="w-2.5 h-2.5 fill-white" /> Urgent
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 bg-red-500/10">
            🔥
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-foreground truncate pr-16">
              {request.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {request.description}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-secondary/50 border border-white/5">
                {request.category}
              </span>
              {request.requester && (
                <>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {request.requester.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {request.requester.email}
                  </span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(request.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => onApprove(request.id)}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" /> Approve
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteRequest(request.id)}
              className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete Request
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirm(true)}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 mr-1" /> Delete User
            </Button>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card text-card-foreground border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account of{" "}
              <strong>{request.requester?.name}</strong> (
              {request.requester?.email}) and all their listings, requests, and
              chats.
              <br />
              <br />
              <span className="font-bold text-destructive">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-secondary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteUserMutation.mutate(request.requester?.id);
                setShowConfirm(false);
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ────────────────────────────── User Card ────────────────────────────────
const UserCard = ({ user, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteUserMutation = useDeleteUserAdmin();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="group bg-secondary/20 border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-foreground truncate">
              {user.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </span>
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {user.phoneNumber}
                </span>
              )}
              {user.department && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {user.department}
                </span>
              )}
              {user.hostel && (
                <span className="px-2 py-0.5 rounded-full bg-secondary/50 border border-white/5">
                  {user.hostel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Joined{" "}
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirm(true)}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card text-card-foreground border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete User Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{user.name}</strong>'s
              account ({user.email}) and all their listings, requests, and
              chats.
              <br />
              <br />
              <span className="font-bold text-destructive">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-secondary/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteUserMutation.mutate(user.id);
                setShowConfirm(false);
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ────────────────────────────── Empty State ─────────────────────────────
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
    <Icon className="w-16 h-16 mb-4 opacity-15" />
    <p className="text-lg font-medium">{message}</p>
  </div>
);

// ════════════════════════════════════════════════════════════════════════
// ADMIN PANEL PAGE
// ════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState("items");

  // Queries — always called (hooks must not be conditional)
  const { data: pendingItems = [], isLoading: loadingItems } =
    usePendingItems();
  const { data: pendingRequests = [], isLoading: loadingRequests } =
    usePendingRequests();
  const { data: urgentRequests = [], isLoading: loadingUrgent } =
    useUrgentRequests();

  // Mutations
  const approveItemMutation = useApproveItem();
  const deleteItemMutation = useDeleteItemAdmin();
  const approveRequestMutation = useApproveRequest();
  const deleteRequestMutation = useDeleteRequestAdmin();
  const deleteUrgentRequestMutation = useDeleteUrgentRequest();
  const approveUrgentRequestMutation = useApproveUrgentRequest();

  // Users
  const { data: allUsers = [], isLoading: loadingUsers } = useAllUsers();

  // Guard: redirect non-admins (after all hooks)
  if (!currentUser || !isAdminEmail(currentUser.email)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <Shield className="w-16 h-16 text-red-500 opacity-50" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
        <Button variant="outline" onClick={() => navigate("/home")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavbarHome />

      <div className="flex-1 container py-8 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">
                Manage listings, requests, and user content
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary/30 p-1 rounded-xl mb-8 w-fit">
          <TabBtn
            active={activeTab === "items"}
            icon={Package}
            label="Pending Items"
            count={pendingItems.length}
            onClick={() => setActiveTab("items")}
          />
          <TabBtn
            active={activeTab === "requests"}
            icon={FileText}
            label="Pending Requests"
            count={pendingRequests.length}
            onClick={() => setActiveTab("requests")}
          />
          <TabBtn
            active={activeTab === "urgent"}
            icon={Zap}
            label="Urgent Reviews"
            count={urgentRequests.length}
            onClick={() => setActiveTab("urgent")}
          />
          <TabBtn
            active={activeTab === "users"}
            icon={Users}
            label="Users"
            count={allUsers.length}
            onClick={() => setActiveTab("users")}
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "items" && (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {loadingItems ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <PendingItemCard
                    key={item.id}
                    item={item}
                    onApprove={(id) => approveItemMutation.mutate(id)}
                    onDelete={(id) => deleteItemMutation.mutate(id)}
                    isApproving={approveItemMutation.isPending}
                    isDeleting={deleteItemMutation.isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Package}
                  message="No pending items to review"
                />
              )}
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {loadingRequests ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <PendingRequestCard
                    key={req.id}
                    request={req}
                    onApprove={(id) => approveRequestMutation.mutate(id)}
                    onDelete={(id) => deleteRequestMutation.mutate(id)}
                    isApproving={approveRequestMutation.isPending}
                    isDeleting={deleteRequestMutation.isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={FileText}
                  message="No pending requests to review"
                />
              )}
            </motion.div>
          )}

          {activeTab === "urgent" && (
            <motion.div
              key="urgent"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {loadingUrgent ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : urgentRequests.length > 0 ? (
                urgentRequests.map((req) => (
                  <UrgentRequestCard
                    key={req.id}
                    request={req}
                    onApprove={(id) => approveUrgentRequestMutation.mutate(id)}
                    onDeleteRequest={(id) =>
                      deleteUrgentRequestMutation.mutate(id)
                    }
                    isApproving={approveUrgentRequestMutation.isPending}
                  />
                ))
              ) : (
                <EmptyState icon={Zap} message="No urgent requests to review" />
              )}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {loadingUsers ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : allUsers.length > 0 ? (
                allUsers.map((user) => <UserCard key={user.id} user={user} />)
              ) : (
                <EmptyState icon={Users} message="No users found" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
