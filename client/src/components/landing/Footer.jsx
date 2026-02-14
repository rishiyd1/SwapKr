import SwapkrLogo from "./SwapkrLogo";
const Footer = () => (<footer className="border-t border-border py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <div>
          <SwapkrLogo />
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            the campus marketplace that actually makes sense
          </p>
        </div>

        <div className="flex gap-16 text-sm">
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Browse</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Sell</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">How it works</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Privacy</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Terms</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          made for nitj students ❤️
        </p>
      </div>
    </div>
  </footer>);
export default Footer;
