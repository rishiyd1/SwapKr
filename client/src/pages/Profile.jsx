import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Home,
  Save,
  Edit2,
  Loader2,
  ArrowLeft,
  Coins,
  Package,
  Zap,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useItems, useMyListings } from "@/hooks/useItems";
import { useRequests, useMyRequests } from "@/hooks/useRequests";
import {
  useProfile,
  useUpdateProfile,
  useDeleteAccount,
} from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth.service"; // Keep for types or utils if needed, but mostly served by hooks
import NavbarHome from "@/components/home/NavbarHome";
import Footer from "@/components/landing/Footer";
import { Link, useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProfileField = ({
  icon: Icon,
  label,
  value,
  isEditing,
  name,
  onChange,
  type = "text",
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </label>
    {isEditing && !disabled ? (
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-secondary/50 border-white/10 focus:border-primary/50"
      />
    ) : (
      <div className="p-3 rounded-md bg-secondary/30 border border-white/5 text-foreground font-medium min-h-[46px] flex items-center">
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </div>
    )}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  /* 
    REFACTOR: Replaced manual state and effects with React Query hooks
    - useProfile handles fetching user data
    - useMyListings handles fetching user's items
    - useMyRequests handles fetching user's requests
    - useUpdateProfile handles profile updates
    - useDeleteAccount handles account deletion
  */
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: myListings, isLoading: isLoadingListings } = useMyListings();
  const { data: myRequests, isLoading: isLoadingRequests } = useMyRequests();

  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    year: "",
    hostel: "",
  });

  // Sync formData when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        department: profile.department || "",
        year: profile.year || "",
        hostel: profile.hostel || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(
      {
        name: formData.name,
        // email is usually not updatable or handled separately
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        year: formData.year,
        hostel: formData.hostel,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }
    deleteAccountMutation.mutate(deletePassword);
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavbarHome />

      <div className="flex-1 container py-8 max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary/30 p-1 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "info"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "listings"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Requests
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar - Avatar & Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg h-[420px] justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-background shadow-inner shrink-0">
                <User className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">
                {profile?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {profile?.email}
              </p>

              <div className="mt-auto w-full p-4 bg-accent/10 rounded-xl border border-accent/20 flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Tokens Available
                </span>
                <div className="flex items-center gap-2 text-3xl font-bold text-accent-foreground">
                  <Coins className="w-8 h-8" />
                  {profile?.tokens || 0}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <AnimatePresence mode="wait">
              {activeTab === "info" ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg relative overflow-hidden h-[420px] flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-semibold">
                        Personal Information
                      </h3>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false);
                              if (profile) {
                                setFormData({
                                  name: profile.name,
                                  email: profile.email,
                                  phoneNumber: profile.phoneNumber,
                                  department: profile.department,
                                  year: profile.year,
                                  hostel: profile.hostel,
                                });
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {updateProfileMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar">
                      <ProfileField
                        icon={User}
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isEditing={isEditing}
                      />
                      <ProfileField
                        icon={Mail}
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isEditing={isEditing}
                        disabled={true}
                      />
                      <ProfileField
                        icon={Phone}
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        isEditing={isEditing}
                        type="tel"
                      />
                      <ProfileField
                        icon={BookOpen}
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        isEditing={isEditing}
                      />
                      <ProfileField
                        icon={Calendar}
                        label="Year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        isEditing={isEditing}
                      />
                      <ProfileField
                        icon={Home}
                        label="Hostel"
                        name="hostel"
                        value={formData.hostel}
                        onChange={handleChange}
                        isEditing={isEditing}
                      />
                    </div>

                    {isEditing && (
                      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <Button
                          variant="destructive"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive font-bold border border-destructive/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    )}
                  </div>

                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <AlertDialogContent className="bg-card text-card-foreground border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete your account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and remove
                          your data from our servers.
                          <br />
                          <br />
                          <span className="font-bold text-destructive">
                            Warning: All your listings, requests, and chats will
                            be lost forever.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">
                          Confirm Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter your password to confirm"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="bg-secondary/50 border-white/10"
                        />
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel
                          className="border-white/10 hover:bg-secondary/50"
                          onClick={() => setDeletePassword("")}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount();
                          }}
                          disabled={
                            deleteAccountMutation.isPending || !deletePassword
                          }
                        >
                          {deleteAccountMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Account"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ) : activeTab === "listings" ? (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg h-[420px] flex flex-col"
                >
                  <h3 className="text-lg font-semibold mb-6 shrink-0">
                    My Item Listings
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingListings ? (
                      <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : myListings?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {myListings.map((item) => (
                          <div
                            key={item.id}
                            className="group bg-secondary/20 border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-16 h-16 rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
                                {item.images && item.images.length > 0 ? (
                                  <img
                                    src={item.images[0].imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <Package className="w-8 h-8 text-muted-foreground opacity-30" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-primary font-display font-semibold mb-1">
                                  ₹{item.price}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      item.status === "Available"
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Link
                              to={`/item/${item.id}`}
                              className="shrink-0 ml-4"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground rounded-full px-4"
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p>You haven't listed any items yet.</p>
                        <Link
                          to="/home"
                          className="text-primary hover:underline text-sm mt-2"
                        >
                          List your first item
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg h-[420px] flex flex-col"
                >
                  <h3 className="text-lg font-semibold mb-6 text-foreground shrink-0">
                    My Item Requests
                  </h3>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingRequests ? (
                      <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : myRequests?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {myRequests.map((request) => (
                          <Link
                            key={request.id}
                            to={`/request/${request.id}`}
                            className="block group bg-secondary/20 border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                          >
                            {request.type === "Urgent" && (
                              <div className="absolute top-0 right-0">
                                <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 uppercase tracking-tighter">
                                  <Zap className="w-2.5 h-2.5 fill-white" />{" "}
                                  Urgent
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner shrink-0 ${request.type === "Urgent" ? "bg-red-500/10" : "bg-primary/10"}`}
                              >
                                {request.type === "Urgent" ? "🔥" : "✨"}
                              </div>
                              <div className="flex-1 min-w-0 pr-12 flex flex-col justify-center">
                                <h4 className="font-display font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                  {request.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(request.createdAt)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <div className="text-4xl mb-4 opacity-20">✨</div>
                        <p className="font-medium">
                          You haven't made any requests yet.
                        </p>
                        <Link
                          to="/home?tab=requests"
                          className="text-primary hover:underline text-sm mt-3 flex items-center gap-2 group"
                        >
                          Make your first request
                          <span className="group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
