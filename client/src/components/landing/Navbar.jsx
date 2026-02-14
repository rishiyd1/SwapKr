import { useEffect, useState } from "react";
import SwapkrLogo from "./SwapkrLogo";
import { Button } from "@/components/ui/button";
const Navbar = ({ onLogin }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);
    return (<nav className={`fixed top-9 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <SwapkrLogo />
        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 font-display text-sm" onClick={onLogin}>
          Login
        </Button>
      </div>
    </nav>);
};
export default Navbar;
