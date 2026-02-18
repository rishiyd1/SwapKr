const StudyTableSVG = () => (
  <svg viewBox="0 0 400 420" fill="none" className="w-full h-auto animate-float">
    {/* Table top */}
    <rect x="30" y="260" width="340" height="14" rx="4" className="fill-secondary" />
    {/* Table legs */}
    <rect x="55" y="274" width="8" height="110" rx="2" className="fill-muted" />
    <rect x="337" y="274" width="8" height="110" rx="2" className="fill-muted" />
    {/* Cross support */}
    <line x1="63" y1="340" x2="345" y2="340" stroke="hsl(220 10% 20%)" strokeWidth="2" />

    {/* Books stack */}
    <rect x="55" y="220" width="80" height="14" rx="2" fill="hsl(42 100% 62% / 0.7)" />
    <rect x="60" y="206" width="70" height="14" rx="2" fill="hsl(165 70% 45% / 0.5)" />
    <rect x="65" y="192" width="60" height="14" rx="2" fill="hsl(42 100% 62% / 0.4)" />
    {/* Book pages detail */}
    <line x1="57" y1="227" x2="133" y2="227" stroke="hsl(42 100% 62% / 0.3)" strokeWidth="0.5" />
    <line x1="62" y1="213" x2="128" y2="213" stroke="hsl(165 70% 45% / 0.2)" strokeWidth="0.5" />

    {/* Calculator */}
    <rect x="165" y="214" width="50" height="44" rx="4" className="fill-primary/80" />
    <rect x="172" y="220" width="36" height="14" rx="2" fill="hsl(220 12% 5% / 0.6)" />
    {/* Calculator buttons */}
    <circle cx="178" cy="242" r="3" fill="hsl(220 12% 5% / 0.4)" />
    <circle cx="190" cy="242" r="3" fill="hsl(220 12% 5% / 0.4)" />
    <circle cx="202" cy="242" r="3" fill="hsl(220 12% 5% / 0.4)" />
    <circle cx="178" cy="252" r="3" fill="hsl(220 12% 5% / 0.4)" />
    <circle cx="190" cy="252" r="3" fill="hsl(220 12% 5% / 0.4)" />
    <circle cx="202" cy="252" r="3" fill="hsl(220 12% 5% / 0.4)" />

    {/* Water bottle */}
    <rect x="240" y="200" width="22" height="58" rx="10" className="fill-accent/40" />
    <rect x="244" y="190" width="14" height="14" rx="4" className="fill-accent/60" />
    {/* Bottle reflection */}
    <line x1="248" y1="210" x2="248" y2="248" stroke="hsl(165 70% 45% / 0.15)" strokeWidth="2" />

    {/* Monitor */}
    <rect x="275" y="155" width="95" height="65" rx="6" className="fill-secondary" />
    <rect x="282" y="162" width="81" height="48" rx="3" fill="hsl(220 10% 14%)" />
    {/* Screen content lines */}
    <line x1="290" y1="175" x2="340" y2="175" stroke="hsl(42 100% 62% / 0.2)" strokeWidth="1.5" />
    <line x1="290" y1="183" x2="330" y2="183" stroke="hsl(165 70% 45% / 0.15)" strokeWidth="1.5" />
    <line x1="290" y1="191" x2="350" y2="191" stroke="hsl(42 100% 62% / 0.1)" strokeWidth="1.5" />
    {/* Monitor stand */}
    <rect x="315" y="220" width="16" height="20" rx="2" className="fill-muted" />
    <rect x="300" y="240" width="46" height="8" rx="3" className="fill-muted" />
    {/* Monitor power LED */}
    <circle cx="322" cy="215" r="1.5" fill="hsl(165 70% 45% / 0.6)" />

    {/* Wires */}
    <path d="M220 256 Q232 290 260 274 Q288 258 300 256" stroke="hsl(220 10% 30%)" strokeWidth="1.5" fill="none" />
    <path d="M145 256 Q158 300 190 284" stroke="hsl(220 10% 25%)" strokeWidth="1.5" fill="none" />

    {/* Small gadget / phone */}
    <rect x="130" y="234" width="24" height="20" rx="3" className="fill-muted-foreground/30" />
    <circle cx="142" cy="244" r="5" className="fill-primary/30" />
    {/* Phone screen glint */}
    <line x1="134" y1="238" x2="138" y2="238" stroke="hsl(42 100% 62% / 0.2)" strokeWidth="1" />

    {/* Pencil */}
    <rect x="108" y="244" width="4" height="18" rx="1" fill="hsl(42 100% 62% / 0.3)" transform="rotate(-15 110 253)" />
  </svg>
);

export default StudyTableSVG;
