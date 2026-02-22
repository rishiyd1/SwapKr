import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SwapkrLogo from "./SwapkrLogo";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { Store, Menu, X } from "lucide-react";

const Navbar = ({ logoActivated }) => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    setUser(authService.getCurrentUser());
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    {
      label: "Browse",
      to: "/products",
      icon: <Store className="h-3.5 w-3.5" />,
    },
    { label: "About Us", href: "#about" },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass top-0" : "bg-transparent top-9"}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <SwapkrLogo activated={logoActivated} />

          <div className="flex items-center gap-6">
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) =>
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm font-body text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>

            {/* Auth buttons */}
            {user ? (
              <Link to="/home">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 font-display text-sm"
                >
                  Browse
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground font-display text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/login?mode=signup" className="hidden md:block">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-sm shadow-sm shadow-primary/20"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Hamburger button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-background/95 backdrop-blur-xl border-l border-white/10 z-[60] flex flex-col"
            >
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex flex-col px-6 gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {link.to ? (
                      <Link
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all font-body"
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all font-body"
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-6 my-4 border-t border-white/10" />

              {/* Auth buttons in mobile */}
              {!user && (
                <div className="flex flex-col gap-3 px-6">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-foreground font-display"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display shadow-sm shadow-primary/20">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
