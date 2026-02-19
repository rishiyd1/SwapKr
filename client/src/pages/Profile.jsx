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
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { itemsService } from "@/services/items.service";
import { requestsService } from "@/services/requests.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import NavbarHome from "@/components/home/NavbarHome";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";

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
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [myListings, setMyListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    year: "",
    hostel: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "listings") {
      fetchMyListings();
    } else if (activeTab === "requests") {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getProfile();
      if (response && response.user) {
        setProfile(response.user);
        setFormData({
          name: response.user.name || "",
          email: response.user.email || "",
          phoneNumber: response.user.phoneNumber || "",
          department: response.user.department || "",
          year: response.user.year || "",
          hostel: response.user.hostel || "",
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyListings = async () => {
    setIsLoadingListings(true);
    try {
      const items = await itemsService.getMyListings();
      setMyListings(items || []);
    } catch (error) {
      toast.error("Failed to fetch your listings");
    } finally {
      setIsLoadingListings(false);
    }
  };

  const fetchMyRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const requests = await requestsService.getMyRequests();
      setMyRequests(requests || []);
    } catch (error) {
      toast.error("Failed to fetch your requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Don't send email as it cannot be changed usually, or backend handles it strictly
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        year: formData.year,
        hostel: formData.hostel,
      };

      const response = await authService.updateProfile(updateData);
      setProfile(response.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-background shadow-inner">
                <User className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {profile?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {profile?.email}
              </p>

              <div className="mt-4 w-full p-3 bg-accent/10 rounded-xl border border-accent/20 flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  Tokens Available
                </span>
                <div className="flex items-center gap-2 text-2xl font-bold text-accent-foreground">
                  <Coins className="w-6 h-6" />
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
                  className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg relative overflow-hidden"
                >
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
                          disabled={isSaving}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isSaving ? (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </motion.div>
              ) : activeTab === "listings" ? (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg min-h-[400px]"
                >
                  <h3 className="text-lg font-semibold mb-6">
                    My Item Listings
                  </h3>

                  {isLoadingListings ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : myListings.length > 0 ? (
                    <div className="space-y-4">
                      {myListings.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-white/5 bg-secondary/20 flex items-center justify-between group hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-secondary/50 overflow-hidden flex items-center justify-center">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0].imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-8 h-8 text-muted-foreground opacity-30" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {item.title}
                              </h4>
                              <p className="text-sm text-primary font-display">
                                ₹{item.price}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    item.status === "Available"
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-red-500/10 text-red-500"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link to={`/item/${item.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                </motion.div>
              ) : (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-card border border-white/10 rounded-2xl p-8 shadow-lg min-h-[400px]"
                >
                  <h3 className="text-lg font-semibold mb-6">
                    My Item Requests
                  </h3>

                  {isLoadingRequests ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : myRequests.length > 0 ? (
                    <div className="space-y-4">
                      {myRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 rounded-xl border border-white/5 bg-secondary/20 flex items-center justify-between group hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                              {request.type === "Urgent" ? "🔥" : "✨"}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {request.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    request.type === "Urgent"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {request.type}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  • {request.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {request.tokenCost > 0
                                ? `Cost: ${request.tokenCost} token`
                                : "Free"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <div className="text-4xl mb-2 opacity-20">✨</div>
                      <p>You haven't made any requests yet.</p>
                      <Link
                        to="/home"
                        className="text-primary hover:underline text-sm mt-2"
                      >
                        Make your first request
                      </Link>
                    </div>
                  )}
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
