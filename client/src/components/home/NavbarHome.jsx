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

const NavbarHome = ({ searchQuery = "", onSearchChange }) => {
  // const [searchQuery, setSearchQuery] = useState(""); // Removed local state
  const [isFocused, setIsFocused] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center space-x-2 w-32 ml-4 md:ml-8 lg:ml-12"
          >
            <SwapkrLogo className="h-6 w-auto" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 justify-center px-2 md:px-4 md:pl-8 h-full items-center">
          <motion.div
            initial={false}
            animate={{ maxWidth: isFocused ? "42rem" : "24rem" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[24rem] md:max-w-none"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 bg-secondary/50 border-white/5 focus-visible:ring-accent w-full transition-all duration-300 text-sm"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Right Actions */}

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative"
            onClick={() => navigate("/chats")}
          >
            <MessageCircle className="h-5 w-5" />
            {unreadSummary?.totalUnread > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                {unreadSummary.totalUnread > 9
                  ? "9+"
                  : unreadSummary.totalUnread}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu
            onOpenChange={(open) => !open && setShowAllNotifications(false)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-card border-white/10 text-card-foreground p-0 overflow-hidden"
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
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full ml-2 bg-secondary/50 border border-white/10"
              >
                <User className="h-5 w-5" />
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
