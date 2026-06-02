const brands = ["MERIDIAN", "NORTHWIND", "ATLAS RETAIL", "VANTA", "HELIOS", "QUANTUM CO", "ARCWAVE", "NORDSTAR", "OBSIDIAN", "LUMEN"];

export function Marquee() {
  const row = [...brands, ...brands];
  return (
    <section className="border-y border-white/5 bg-background/40 py-8 overflow-hidden">
      <div className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
        Trusted by operations teams at modern retailers
      </div>
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap min-w-max">
          {row.map((b, i) => (
            <span key={i} className="text-foreground/40 font-display font-semibold tracking-[0.25em] text-sm">
              {b}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
