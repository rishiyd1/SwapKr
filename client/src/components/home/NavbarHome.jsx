import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  MessageCircle,
  User,
  LogOut,
  PlusCircle,
  Trash2,
  Check,
  Shield,
} from "lucide-react";

import CreateItemDialog from "../items/CreateItemDialog";
import CreateRequestDialog from "../requests/CreateRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SwapkrLogo from "@/components/landing/SwapkrLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";
import { notificationsService } from "@/services/notifications.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/chat/SocketContext";
import { chatsService } from "@/services/chats.service";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const NavbarHome = ({
  searchQuery = "",
  onSearchChange,
  hiddenOnMobile = false,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Keep internal state in sync if prop changes
    setInternalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Refresh profile to get the latest role/tokens
        if (currentUser) {
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.user) {
            setUser(profileRes.user);
            localStorage.setItem("user", JSON.stringify(profileRes.user));
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.getNotifications,
    refetchInterval: 30000,
    enabled: !!user,
  });

  const { socket } = useSocket();

  const { data: unreadSummary, refetch: refetchUnread } = useQuery({
    queryKey: ["unreadChatSummary"],
    queryFn: chatsService.getUnreadSummary,
    refetchInterval: 15000,
    enabled: !!user,
  });

  // Listen for real-time updates to unread counts
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        refetchUnread();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };
      socket.on("receive_message", handleUpdate);
      socket.on("new_buy_request", handleUpdate);
      return () => {
        socket.off("receive_message", handleUpdate);
        socket.off("new_buy_request", handleUpdate);
      };
    }
  }, [socket, refetchUnread, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const displayedNotifications = showAllNotifications
    ? notifications
    : notifications.filter((n) => !n.isRead);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${
        hiddenOnMobile ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="container flex h-16 items-center px-2 md:px-6">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center space-x-2 w-auto md:w-32 ml-2 sm:ml-4 md:ml-8 lg:ml-12 shrink-0"
          >
            <SwapkrLogo className="h-5 sm:h-6 w-auto flex-shrink-0" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 justify-center px-1 md:px-4 md:pl-8 h-full items-center min-w-0">
          <motion.div
            initial={false}
            animate={{ flexGrow: isFocused ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[12rem] xs:max-w-[16rem] sm:max-w-[24rem] md:max-w-[42rem] min-w-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-secondary/50 border-white/5 focus-visible:ring-accent w-full transition-all duration-300 text-sm"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={internalSearchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setInternalSearchQuery(val);
                if (onSearchChange) {
                  onSearchChange(val);
                } else {
                  // If we are not on the home page, redirect to home page with query
                  if (location.pathname !== "/home") {
                    navigate(`/home?search=${encodeURIComponent(val)}`);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && location.pathname !== "/home") {
                  navigate(
                    `/home?search=${encodeURIComponent(internalSearchQuery)}`,
                  );
                }
              }}
            />
          </motion.div>
        </div>

        {/* Right Actions */}

        {/* Right Actions */}
        <div className="flex items-center gap-0.5 sm:gap-2 ml-auto shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative w-8 h-8 sm:w-10 sm:h-10"
            onClick={() => navigate("/chats")}
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadSummary?.totalUnread > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white ring-2 ring-background">
                {unreadSummary.totalUnread > 9
                  ? "9+"
                  : unreadSummary.totalUnread}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu
            modal={false}
            onOpenChange={(open) => !open && setShowAllNotifications(false)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative w-8 h-8 sm:w-10 sm:h-10"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-card border-white/10 text-card-foreground p-0 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <DropdownMenuLabel className="p-0 font-semibold">
                  Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs text-accent hover:text-accent/80 hover:bg-accent/10 -mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllReadMutation.mutate();
                    }}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {displayedNotifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p className="text-sm">
                      {showAllNotifications
                        ? "No notifications yet"
                        : "No new notifications"}
                    </p>
                    {!showAllNotifications && notifications.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-accent"
                        onClick={() => setShowAllNotifications(true)}
                      >
                        View older activity
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {displayedNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3 p-4 border-b border-white/5 transition-colors hover:bg-white/5 relative group cursor-pointer ${
                          !notif.isRead
                            ? "bg-accent/[0.08] border-l-2 border-l-accent"
                            : "border-l-2 border-l-transparent"
                        }`}
                        onClick={() => {
                          if (!notif.isRead) markReadMutation.mutate(notif.id);
                          if (notif.type === "Request") {
                            navigate("/home?tab=requests");
                          } else if (notif.type === "buy_request") {
                            navigate(`/chats?requestId=${notif.relatedId}`);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-tight mb-1 ${!notif.isRead ? "font-semibold pr-6" : ""}`}
                          >
                            {notif.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={() => markReadMutation.mutate(notif.id)}
                            className="absolute right-4 top-4 h-2 w-2 rounded-full bg-accent"
                            title="Mark as read"
                          />
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(notif.id)}
                          className="opacity-0 group-hover:opacity-100 absolute right-4 bottom-4 text-muted-foreground hover:text-red-500 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!showAllNotifications && notifications.length > unreadCount && (
                <>
                  <DropdownMenuSeparator className="bg-white/10 m-0" />
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-none text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllNotifications(true);
                    }}
                  >
                    View all activity
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateRequestDialog />
          <CreateItemDialog />

          {/* Profile Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full ml-1 sm:ml-2 bg-secondary/50 border border-white/10 w-8 h-8 sm:w-10 sm:h-10"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card border-white/10 text-card-foreground"
            >
              <DropdownMenuLabel>
                {user ? (
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {user.email}
                    </span>
                  </div>
                ) : (
                  "My Account"
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="cursor-pointer">
                <Link to="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              {user &&
                [
                  "kushagars.ic.23@nitj.ac.in",
                  "rishi.ic.23@nitj.ac.in",
                  "vedanshm.ee.23@nitj.ac.in",
                  "ashishg.ic.23@nitj.ac.in",
                ].includes(user.email?.toLowerCase()) && (
                  <DropdownMenuItem className="cursor-pointer">
                    <Link
                      to="/admin"
                      className="flex items-center w-full text-purple-400"
                    >
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={handleLogout}
              >
                <div className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavbarHome;
