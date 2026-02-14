const StudyTableSVG = () => (<svg viewBox="0 0 400 320" fill="none" className="w-full h-auto animate-float">
    {/* Table */}
    <rect x="40" y="200" width="320" height="12" rx="4" className="fill-secondary"/>
    <rect x="60" y="212" width="8" height="80" rx="2" className="fill-muted"/>
    <rect x="332" y="212" width="8" height="80" rx="2" className="fill-muted"/>

    {/* Books stack */}
    <rect x="60" y="168" width="70" height="12" rx="2" fill="hsl(42 100% 62% / 0.7)"/>
    <rect x="64" y="156" width="62" height="12" rx="2" fill="hsl(165 70% 45% / 0.5)"/>
    <rect x="68" y="144" width="54" height="12" rx="2" fill="hsl(42 100% 62% / 0.4)"/>

    {/* Calculator */}
    <rect x="160" y="160" width="45" height="38" rx="4" className="fill-primary/80"/>
    <rect x="166" y="166" width="33" height="12" rx="2" fill="hsl(220 12% 5% / 0.6)"/>
    <circle cx="172" cy="186" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>
    <circle cx="182" cy="186" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>
    <circle cx="192" cy="186" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>
    <circle cx="172" cy="193" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>
    <circle cx="182" cy="193" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>
    <circle cx="192" cy="193" r="2.5" fill="hsl(220 12% 5% / 0.4)"/>

    {/* Water bottle */}
    <rect x="230" y="152" width="18" height="48" rx="8" className="fill-accent/40"/>
    <rect x="233" y="145" width="12" height="10" rx="3" className="fill-accent/60"/>

    {/* Monitor */}
    <rect x="270" y="120" width="80" height="55" rx="6" className="fill-secondary"/>
    <rect x="276" y="126" width="68" height="40" rx="3" fill="hsl(220 10% 14%)"/>
    <rect x="303" y="175" width="14" height="15" rx="2" className="fill-muted"/>
    <rect x="290" y="190" width="40" height="6" rx="2" className="fill-muted"/>

    {/* Wires */}
    <path d="M210 195 Q220 220 250 210 Q280 200 290 195" stroke="hsl(220 10% 30%)" strokeWidth="1.5" fill="none"/>
    <path d="M140 195 Q150 230 180 220" stroke="hsl(220 10% 25%)" strokeWidth="1.5" fill="none"/>

    {/* Small gadget */}
    <rect x="130" y="180" width="20" height="16" rx="3" className="fill-muted-foreground/30"/>
    <circle cx="140" cy="188" r="4" className="fill-primary/30"/>
  </svg>);
export default StudyTableSVG;
