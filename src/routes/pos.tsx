import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Minus, Trash2, ScanLine, CreditCard, Wallet, Smartphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pos")({
  head: () => ({ meta: [{ title: "POS · NexaStock" }] }),
  component: POSPage,
});

const catalog = [
  { sku: "ATR-020", name: "Atorva-20", cat: "Cardiac", price: 142 },
  { sku: "PNT-040", name: "Pantop-40", cat: "Gastro", price: 88 },
  { sku: "GLM-002", name: "Glimer-2", cat: "Diabetes", price: 64 },
  { sku: "TLM-040", name: "Telma-40", cat: "Cardiac", price: 110 },
  { sku: "CRC-001", name: "Crocin Adv.", cat: "OTC", price: 28 },
  { sku: "AZE-500", name: "Azee-500", cat: "Antibiotic", price: 96 },
  { sku: "DLX-30", name: "Duloxe-30", cat: "Neuro", price: 175 },
  { sku: "VIT-D3", name: "Vitamin D3", cat: "OTC", price: 42 },
  { sku: "PRC-650", name: "Paracetamol-650", cat: "OTC", price: 18 },
  { sku: "ORS-200", name: "ORS Pro", cat: "OTC", price: 22 },
  { sku: "MTF-500", name: "Metformin-500", cat: "Diabetes", price: 22 },
  { sku: "RBZ-20", name: "Rabez-20", cat: "Gastro", price: 76 },
];

type Line = { sku: string; name: string; price: number; qty: number };

function POSPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [cart, setCart] = useState<Line[]>([
    { sku: "ATR-020", name: "Atorva-20", price: 142, qty: 1 },
    { sku: "CRC-001", name: "Crocin Adv.", price: 28, qty: 2 },
  ]);

  const cats = ["All", ...Array.from(new Set(catalog.map((c) => c.cat)))];
  const filtered = useMemo(
    () =>
      catalog.filter(
        (p) =>
          (cat === "All" || p.cat === cat) &&
          (query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.includes(query.toUpperCase())),
      ),
    [query, cat],
  );

  const add = (p: (typeof catalog)[number]) =>
    setCart((c) => {
      const existing = c.find((l) => l.sku === p.sku);
      return existing
        ? c.map((l) => (l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l))
        : [...c, { sku: p.sku, name: p.name, price: p.price, qty: 1 }];
    });
  const inc = (sku: string) => setCart((c) => c.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)));
  const dec = (sku: string) =>
    setCart((c) => c.flatMap((l) => (l.sku === sku ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])));
  const remove = (sku: string) => setCart((c) => c.filter((l) => l.sku !== sku));

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-background/70 backdrop-blur-xl px-5 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-semibold tracking-tight">NexaStock <span className="text-muted-foreground font-normal">POS</span></span>
        </Link>
        <span className="ml-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-white/10 text-muted-foreground">
          Bandra Flagship · Counter 02
        </span>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" /> Online · Synced
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold">PR</div>
      </header>

      <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_420px] gap-0">
        {/* Catalog */}
        <section className="p-5 overflow-y-auto">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
            <ScanLine className="w-4 h-4 text-primary" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Scan barcode or search SKU / product…"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  cat === c ? "bg-white/10 text-foreground border-white/20" : "border-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
            {filtered.map((p) => (
              <motion.button
                key={p.sku}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => add(p)}
                className="glass rounded-2xl p-4 text-left shadow-card relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.cat}</div>
                <div className="mt-1.5 font-medium leading-snug pr-8">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.sku}</div>
                <div className="mt-4 font-display text-xl">${p.price}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Cart */}
        <aside className="border-l border-white/5 bg-[oklch(0.14_0.012_260)]/60 backdrop-blur-xl flex flex-col">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="font-display text-lg">Current order</div>
            <div className="text-xs text-muted-foreground">#NX-{Math.floor(Math.random() * 90000) + 10000} · {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            <AnimatePresence initial={false}>
              {cart.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-12">Scan or tap products to add</div>
              )}
              {cart.map((l) => (
                <motion.div
                  key={l.sku}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground">${l.price} × {l.qty}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => dec(l.sku)} className="w-7 h-7 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button onClick={() => inc(l.sku)} className="w-7 h-7 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">${(l.price * l.qty).toFixed(0)}</div>
                  <button onClick={() => remove(l.sku)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-5 py-3 border-t border-white/5 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST (12%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-display text-xl pt-1.5"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          <div className="px-5 pb-3">
            <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5" />
              <div className="text-xs">
                <div className="text-foreground">AI suggests adding <span className="text-primary">Vitamin D3</span></div>
                <div className="text-muted-foreground">Frequently bought with Atorva-20</div>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { i: CreditCard, l: "Card" },
                { i: Smartphone, l: "UPI" },
                { i: Wallet, l: "Cash" },
              ].map((p) => (
                <button key={p.l} className="h-12 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-xs inline-flex flex-col items-center justify-center gap-1">
                  <p.i className="w-4 h-4" /> {p.l}
                </button>
              ))}
            </div>
            <button className="w-full h-12 rounded-xl bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow font-medium">
              Charge ${total.toFixed(2)}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
