import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo size={32} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            The AI-powered multi-store inventory & retail intelligence platform.
            Designed for the next decade of operations.
          </p>
        </div>
        {[
          {h:"Platform", l:["Inventory","AI Center","POS","Analytics","Roles"]},
          {h:"Company", l:["About","Customers","Pricing","Security","Contact"]},
        ].map(col => (
          <div key={col.h}>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{col.h}</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.l.map(i => <li key={i}><a className="text-foreground/80 hover:text-foreground" href="#">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexaStock Inc. · Crafted for modern retail.
      </div>
    </footer>
  );
}
