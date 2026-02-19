import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SwapkrLogo from "./SwapkrLogo";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const Navbar = ({ logoActivated }) => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    setUser(authService.getCurrentUser());
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass top-0" : "bg-transparent top-9"}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <SwapkrLogo activated={logoActivated} />

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </a>
          </div>

          <Link to={user ? "/home" : "/login"}>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/10 font-display text-sm"
            >
              {user ? "Browse" : "Login"}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
