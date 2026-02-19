import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Settings,
  PlusCircle,
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

const NavbarHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Logo (Fixed width to prevent search bar jump on hover) */}
        <div className="w-32 flex items-center">
          <Link to="/home" className="flex items-center space-x-2">
            <SwapkrLogo className="h-6 w-auto" />
          </Link>
        </div>

        {/* Search Bar (Centered using flex-1 with a slight right offset) */}
        <div className="hidden md:flex flex-1 justify-center px-4 pl-12 h-full items-center">
          <motion.div
            initial={false}
            animate={{ maxWidth: isFocused ? "42rem" : "24rem" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for books, electronics, furniture..."
              className="pl-10 bg-secondary/50 border-white/5 focus-visible:ring-accent w-full transition-all duration-300"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile Search Trigger could go here */}

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </Button>

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
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Settings
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
