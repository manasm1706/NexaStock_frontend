import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Minus, Trash2, ScanLine, CreditCard, Wallet, Smartphone, Sparkles, Loader2, Store as StoreIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/pos")({
  head: () => ({ meta: [{ title: "POS · NexaStock" }] }),
  component: POSPage,
});

type Line = { id: string; sku: string; name: string; price: number; qty: number; taxRate: number };

function POSPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [cart, setCart] = useState<Line[]>([]);

  // Customer & Payment States
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"card" | "upi" | "cash">("cash");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState<string>("");

  // Fetch products, locations, and AI recommendations
  const { data: productsData = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts()
  });

  const { data: locationsData = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations()
  });

  const { data: aiInsights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => api.getAIInsights()
  });

  const stores = useMemo(() => {
    return locationsData.filter((loc: any) => loc.type === "store");
  }, [locationsData]);

  // Set default store location
  useEffect(() => {
    if (stores.length > 0 && !selectedLocId) {
      setSelectedLocId(stores[0].id);
    }
  }, [stores, selectedLocId]);

  const activeLocation = useMemo(() => {
    return locationsData.find((loc: any) => loc.id === selectedLocId) || stores[0];
  }, [locationsData, selectedLocId, stores]);

  const catalog = useMemo(() => {
    return productsData.map((prod: any) => ({
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      cat: prod.category,
      price: prod.sellingPrice || 100,
      taxRate: prod.taxRate || 12
    }));
  }, [productsData]);

  const cats = useMemo(() => {
    return ["All", ...Array.from(new Set(catalog.map((c) => c.cat)))];
  }, [catalog]);

  const filtered = useMemo(() => {
    return catalog.filter(
      (p) =>
        (cat === "All" || p.cat === cat) &&
        (query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())),
    );
  }, [query, cat, catalog]);

  const add = (p: (typeof catalog)[number]) =>
    setCart((c) => {
      const existing = c.find((l) => l.sku === p.sku);
      return existing
        ? c.map((l) => (l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l))
        : [...c, { id: p.id, sku: p.sku, name: p.name, price: p.price, qty: 1, taxRate: p.taxRate }];
    });

  const inc = (sku: string) => setCart((c) => c.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)));
  const dec = (sku: string) =>
    setCart((c) => c.flatMap((l) => (l.sku === sku ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])));
  const remove = (sku: string) => setCart((c) => c.filter((l) => l.sku !== sku));

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = +(cart.reduce((t, l) => t + (l.price * l.qty * (l.taxRate / 100)), 0)).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  // Suggested Upsell based on AI Insights
  const upsellProduct = useMemo(() => {
    const defaultProduct = catalog.find(p => p.sku === "MED-PARA-500") || catalog[0];
    if (aiInsights?.recommendations?.length > 0) {
      // Find a catalog product mentioned in recommendations
      for (const rec of aiInsights.recommendations) {
        const match = catalog.find(p => rec.toLowerCase().includes(p.name.toLowerCase()) || rec.toLowerCase().includes(p.sku.toLowerCase()));
        if (match) return match;
      }
    }
    return defaultProduct;
  }, [aiInsights, catalog]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!activeLocation) {
      toast.error("Please select a store counter first");
      return;
    }

    setIsCheckingOut(true);
    try {
      await api.createPOSInvoice({
        locationId: activeLocation.id,
        paymentMode,
        customerName: custName || undefined,
        customerPhone: custPhone || undefined,
        lines: cart.map((l) => ({
          productId: l.id,
          productName: l.name,
          quantity: l.qty,
          unitPrice: l.price,
          taxRate: l.taxRate,
          discount: 0
        }))
      });

      toast.success("Transaction completed successfully!");
      setCart([]);
      setCustName("");
      setCustPhone("");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isLoading = loadingProducts || loadingLocations;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-background/70 backdrop-blur-xl px-5 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-semibold tracking-tight">NexaStock <span className="text-muted-foreground font-normal">POS</span></span>
        </Link>
        
        <div className="flex items-center gap-2">
          <StoreIcon className="w-4 h-4 text-muted-foreground" />
          <select 
            className="bg-transparent text-xs font-semibold text-foreground outline-none border border-white/10 rounded px-2 py-1 max-w-[200px]"
            value={selectedLocId} 
            onChange={(e) => setSelectedLocId(e.target.value)}
          >
            {stores.map((s: any) => (
              <option key={s.id} value={s.id} className="bg-background text-foreground">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" /> Online · Connected
        </div>
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold">PR</div>
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
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground text-foreground"
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
                <div className="mt-1.5 font-medium leading-snug pr-8 text-foreground">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.sku}</div>
                <div className="mt-4 font-display text-xl text-foreground">${p.price}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Cart */}
        <aside className="border-l border-white/5 bg-[oklch(0.14_0.012_260)]/60 backdrop-blur-xl flex flex-col">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="font-display text-lg text-foreground">Current order</div>
            <div className="text-xs text-muted-foreground">Location: {activeLocation?.name || "None"}</div>
          </div>

          {/* Customer info fields */}
          <div className="px-5 py-2 border-b border-white/5 grid grid-cols-2 gap-2">
            <input 
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="Cust Name (Opt)" 
              className="bg-white/3 border border-white/10 rounded-lg text-xs p-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-primary/50"
            />
            <input 
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="Cust Phone (Opt)" 
              className="bg-white/3 border border-white/10 rounded-lg text-xs p-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-primary/50"
            />
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
                  className="rounded-xl border border-white/10 bg-white/3 p-3 flex items-center gap-3 text-foreground"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground">${l.price} × {l.qty} (Tax {l.taxRate}%)</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => dec(l.sku)} className="w-7 h-7 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center cursor-pointer">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button onClick={() => inc(l.sku)} className="w-7 h-7 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center cursor-pointer">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">${(l.price * l.qty).toFixed(0)}</div>
                  <button onClick={() => remove(l.sku)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="px-5 py-3 border-t border-white/5 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Estimated Taxes</span><span className="text-foreground">${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-display text-xl pt-1.5 text-foreground"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          {upsellProduct && (
            <div className="px-5 pb-3">
              <button 
                onClick={() => add(upsellProduct)}
                className="w-full text-left rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5" />
                <div className="text-xs">
                  <div className="text-foreground">AI suggestion: Add <span className="text-primary font-medium">{upsellProduct.name}</span></div>
                  <div className="text-muted-foreground">Frequently bought matching items. Tap to add.</div>
                </div>
              </button>
            </div>
          )}

          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { type: "card" as const, i: CreditCard, l: "Card" },
                { type: "upi" as const, i: Smartphone, l: "UPI" },
                { type: "cash" as const, i: Wallet, l: "Cash" },
              ].map((p) => (
                <button 
                  key={p.l} 
                  onClick={() => setPaymentMode(p.type)}
                  className={`h-12 rounded-xl border text-xs inline-flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    paymentMode === p.type ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-white/3 hover:bg-white/6 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <p.i className="w-4 h-4" /> {p.l}
                </button>
              ))}
            </div>
            <button 
              disabled={isCheckingOut || cart.length === 0}
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Charge ${total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
