import { Shield } from "lucide-react";
import { useState } from "react";
const ExclusivityBar = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (<div className="relative w-full h-9 flex items-center justify-center glow-border bg-secondary/50">
      <div className="flex items-center gap-2 text-xs tracking-widest uppercase cursor-default" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <Shield className="w-3.5 h-3.5 text-primary"/>
        <span className="text-muted-foreground">Exclusively for NITJ students</span>
      </div>
      {showTooltip && (<div className="absolute top-full mt-2 px-3 py-1.5 rounded-md glass text-xs text-foreground z-50 animate-fade-in">
          Only @nitj.ac.in emails allowed
        </div>)}
    </div>);
};
export default ExclusivityBar;
