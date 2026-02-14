const words = ["sell", "exchange", "request", "buy", "bid", "rent", "trade", "borrow", "give away"];
const repeated = [...words, ...words, ...words, ...words];
const ActionStrip = () => (<section className="py-10 overflow-hidden border-y border-border/50">
    <div className="marquee flex gap-8 whitespace-nowrap w-max">
      {repeated.map((word, i) => (<span key={i} className="font-display text-2xl sm:text-3xl font-semibold text-muted-foreground/40 glow-text select-none">
          {word}
          <span className="mx-4 text-primary/30">•</span>
        </span>))}
    </div>
  </section>);
export default ActionStrip;
