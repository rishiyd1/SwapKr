import SwapkrLogo from "./SwapkrLogo";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/auth.service";

const Footer = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleBrowse = () => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  const handleSell = () => {
    if (user) {
      navigate("/home?open=sell");
    } else {
      navigate("/login");
    }
  };

  return (
    <footer className="border-t border-border py-12 px-6 relative overflow-hidden bg-background">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="footerDots"
              x="0"
              y="0"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="15" cy="15" r="0.8" fill="hsl(42 100% 62%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footerDots)" />
        </svg>
      </div>

      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(42 100% 62% / 0.4) 50%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <SwapkrLogo />
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              the campus marketplace that actually makes sense
            </p>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li
                  onClick={handleBrowse}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Browse
                </li>
                <li
                  onClick={handleSell}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Sell
                </li>
                <li>
                  <a
                    href="/#how-it-works"
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    How it works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground transition-colors cursor-pointer">
                  Privacy
                </li>
                <li className="hover:text-foreground transition-colors cursor-pointer">
                  Terms
                </li>
                <li>
                  <a
                    href="/#about"
                    className="hover:text-foreground transition-colors cursor-pointer"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            made for nitj cutees ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
