import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Minus, Trash2, ScanLine, CreditCard, Wallet, Smartphone, Sparkles, Loader2, Store as StoreIcon, Pause, Play, Printer, Receipt } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pos")({
  head: () => ({ meta: [{ title: "POS · NexaStock" }] }),
  component: POSPage,
});

type Line = { 
  id: string; 
  sku: string; 
  name: string; 
  price: number; 
  qty: number; 
  taxRate: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
};

function POSPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [cart, setCart] = useState<Line[]>([]);

  // Customer & Payment States
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [paymentMode, setPaymentMode] = useState<"card" | "upi" | "cash" | "wallet">("cash");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState<string>("");

  // Overall Discount States
  const [orderDiscountType, setOrderDiscountType] = useState<"percentage" | "fixed">("fixed");
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);

  // Suspend/Resume States
  const [suspendedSales, setSuspendedSales] = useState<any[]>([]);
  const [suspendLabel, setSuspendLabel] = useState("");
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  // Receipt States
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Fetch products, locations, inventory balances, and AI recommendations
  const { data: productsData = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts()
  });

  const { data: locationsData = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations()
  });

  const { data: balancesData = [], isLoading: loadingBalances } = useQuery({
    queryKey: ["inventory-balances"],
    queryFn: () => api.getInventoryBalances()
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
      taxRate: prod.taxRate || 12,
      barcode: prod.barcode || prod.sku
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

  // Stock lookup helper for selected location
  const getAvailableStock = (productId: string) => {
    if (!selectedLocId) return 0;
    const balance = balancesData.find(
      (bal: any) => bal.productId === productId && bal.locationId === selectedLocId
    );
    return balance ? balance.quantity : 0;
  };

  const add = (p: (typeof catalog)[number]) => {
    const stock = getAvailableStock(p.id);
    if (stock <= 0) {
      toast.error(`No stock available for "${p.name}" (${p.sku}) at this location.`);
      return;
    }
    
    setCart((c) => {
      const existing = c.find((l) => l.sku === p.sku);
      if (existing) {
        if (existing.qty + 1 > stock) {
          toast.error(`Insufficient stock. Only ${stock} units available.`);
          return c;
        }
        return c.map((l) => (l.sku === p.sku ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...c, { id: p.id, sku: p.sku, name: p.name, price: p.price, qty: 1, taxRate: p.taxRate, discountType: "fixed", discountValue: 0 }];
    });
  };

  const inc = (sku: string) => {
    const item = cart.find(l => l.sku === sku);
    if (!item) return;
    const stock = getAvailableStock(item.id);
    if (item.qty + 1 > stock) {
      toast.error(`Insufficient stock. Only ${stock} units available.`);
      return;
    }
    setCart((c) => c.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)));
  };

  const dec = (sku: string) => {
    setCart((c) =>
      c.map((l) => {
        if (l.sku === sku) {
          return { ...l, qty: Math.max(1, l.qty - 1) };
        }
        return l;
      })
    );
  };

  const remove = (sku: string) => setCart((c) => c.filter((l) => l.sku !== sku));

  const updateLineDiscount = (sku: string, field: "discountType" | "discountValue", val: any) => {
    setCart((c) =>
      c.map((l) => {
        if (l.sku === sku) {
          return {
            ...l,
            [field]: val
          };
        }
        return l;
      })
    );
  };

  // Calculations
  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);

  const getLineDiscount = (l: Line) => {
    const lineSubtotal = l.price * l.qty;
    const val = l.discountValue || 0;
    if (l.discountType === "percentage") {
      return +(lineSubtotal * (val / 100)).toFixed(2);
    }
    return Math.min(lineSubtotal, val);
  };

  const lineDiscountsTotal = cart.reduce((sum, l) => sum + getLineDiscount(l), 0);

  const orderSubtotalAfterLineDiscounts = Math.max(0, subtotal - lineDiscountsTotal);
  const orderDiscount = orderDiscountType === "percentage"
    ? +(orderSubtotalAfterLineDiscounts * (orderDiscountValue / 100)).toFixed(2)
    : Math.min(orderSubtotalAfterLineDiscounts, orderDiscountValue);

  const totalDiscount = +(lineDiscountsTotal + orderDiscount).toFixed(2);

  const getFinalLineDiscount = (l: Line) => {
    const lineSub = l.price * l.qty;
    const lineDisc = getLineDiscount(l);
    const lineNet = Math.max(0, lineSub - lineDisc);
    
    const totalNet = subtotal - lineDiscountsTotal;
    const orderDiscShare = totalNet > 0 ? (lineNet / totalNet) * orderDiscount : 0;
    
    return +(lineDisc + orderDiscShare).toFixed(2);
  };

  const tax = +(cart.reduce((t, l) => {
    const lineSub = l.price * l.qty;
    const finalLineDisc = getFinalLineDiscount(l);
    const netAmount = Math.max(0, lineSub - finalLineDisc);
    return t + (netAmount * (l.taxRate / 100));
  }, 0)).toFixed(2);

  const total = +(subtotal - totalDiscount + tax).toFixed(2);

  // Suspend / Resume cart helpers
  const handleSuspendSale = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: Math.random().toString(36).substring(7),
      name: suspendLabel.trim() || `Hold #${suspendedSales.length + 1}`,
      cart,
      custName,
      custPhone,
      paymentMode,
      orderDiscountType,
      orderDiscountValue,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSuspendedSales([...suspendedSales, newHold]);
    setCart([]);
    setCustName("");
    setCustPhone("");
    setOrderDiscountValue(0);
    setIsSuspendModalOpen(false);
    toast.success(`Sale "${newHold.name}" suspended successfully`);
  };

  const handleResumeSale = (sale: any) => {
    setCart(sale.cart);
    setCustName(sale.custName);
    setCustPhone(sale.custPhone);
    setPaymentMode(sale.paymentMode);
    setOrderDiscountType(sale.orderDiscountType);
    setOrderDiscountValue(sale.orderDiscountValue);
    setSuspendedSales(suspendedSales.filter(s => s.id !== sale.id));
    toast.success(`Resumed "${sale.name}"`);
  };

  // Barcode / SKU search enter-key helper
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return;
      
      const matched = catalog.find(
        p => p.sku.toLowerCase() === trimmed || (p.barcode && p.barcode.toLowerCase() === trimmed)
      );
      
      if (matched) {
        add(matched);
        setQuery("");
        toast.success(`Added ${matched.name} to cart`);
      } else {
        toast.error(`No matching product found for "${query}"`);
      }
    }
  };

  // Suggested Upsell based on AI Insights
  const upsellProduct = useMemo(() => {
    const defaultProduct = catalog.find(p => p.sku === "MED-PARA-500") || catalog[0];
    if (aiInsights?.recommendations?.length > 0) {
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

    // Front-end Stock pre-check validation
    for (const item of cart) {
      const stock = getAvailableStock(item.id);
      if (item.qty > stock) {
        toast.error(`Stock validation failed: "${item.name}" exceeds available stock (${stock} units left).`);
        return;
      }
    }

    setIsCheckingOut(true);
    try {
      const invoiceData = await api.createPOSInvoice({
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
          discount: getFinalLineDiscount(l) // Distribute Overall discount proportionally
        }))
      });

      // Save Invoice data to state for Receipt printing
      setLastInvoice({
        ...invoiceData,
        locationName: activeLocation.name,
        locationCode: activeLocation.code,
        customerName: custName,
        customerPhone: custPhone,
        paymentMode: paymentMode.toUpperCase(),
        subtotal,
        discountTotal: totalDiscount,
        taxTotal: tax,
        grandTotal: total,
        lines: cart.map((l) => {
          const disc = getFinalLineDiscount(l);
          const itemSub = l.price * l.qty;
          const itemNet = Math.max(0, itemSub - disc);
          const itemTax = itemNet * (l.taxRate / 100);
          return {
            name: l.name,
            qty: l.qty,
            price: l.price,
            discount: disc,
            tax: +itemTax.toFixed(2),
            total: +(itemNet + itemTax).toFixed(2)
          };
        })
      });

      toast.success("Transaction completed successfully!");
      setCart([]);
      setCustName("");
      setCustPhone("");
      setOrderDiscountValue(0);
      setIsReceiptOpen(true);

      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isLoading = loadingProducts || loadingLocations || loadingBalances;

  const handlePrintReceipt = () => {
    const printContent = document.getElementById("thermal-receipt")?.innerHTML;
    if (!printContent) return;
    
    const win = window.open("", "_blank");
    if (!win) return;
    
    win.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              font-family: monospace;
              font-size: 12px;
              color: #000;
              background: #fff;
              padding: 20px;
              width: 80mm;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .border-top { border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; }
            .border-bottom { border-bottom: 1px dashed #000; margin-bottom: 5px; padding-bottom: 5px; }
            .header { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .flex { display: flex; justify-content: space-between; }
            .mt-1 { margin-top: 5px; }
            .mt-2 { margin-top: 10px; }
            .mb-2 { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

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
              onKeyDown={handleSearchKeyDown}
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
            {filtered.map((p) => {
              const stock = getAvailableStock(p.id);
              return (
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
                  <div className="mt-2 text-[10px] text-muted-foreground">Stock: <span className={stock <= 5 ? "text-warning font-semibold" : "text-foreground font-semibold"}>{stock}</span></div>
                  <div className="mt-2 font-display text-xl text-foreground">${p.price}</div>
                </motion.button>
              );
            })}
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
              className="bg-white/3 border border-white/10 rounded-lg text-xs p-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-primary/50 animate-in"
            />
            <input 
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="Cust Phone (Opt)" 
              className="bg-white/3 border border-white/10 rounded-lg text-xs p-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-primary/50 animate-in"
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
                  className="rounded-xl border border-white/10 bg-white/3 p-3 flex flex-col gap-2 text-foreground"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0 pr-2">
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
                    <div className="w-16 text-right text-sm font-medium">${(l.price * l.qty).toFixed(2)}</div>
                    <button onClick={() => remove(l.sku)} className="text-muted-foreground hover:text-destructive cursor-pointer ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Item Discount Controls */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Item Disc:</span>
                      <select
                        value={l.discountType || "fixed"}
                        onChange={(e) => updateLineDiscount(l.sku, "discountType", e.target.value as any)}
                        className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-foreground outline-none text-[9px]"
                      >
                        <option value="fixed" className="bg-background">$</option>
                        <option value="percentage" className="bg-background">%</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={l.discountValue || ""}
                        onChange={(e) => updateLineDiscount(l.sku, "discountValue", Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-10 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-foreground outline-none text-right text-[10px]"
                      />
                    </div>
                    {getLineDiscount(l) > 0 && (
                      <div className="text-primary font-medium">Saved -${getLineDiscount(l).toFixed(2)}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart holding / Suspend & Resume actions */}
          <div className="px-5 py-2.5 border-t border-white/5 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 cursor-pointer"
              onClick={() => {
                setCart([]);
                toast.success("Cart cleared");
              }}
              disabled={cart.length === 0}
            >
              Clear Cart
            </Button>

            <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 cursor-pointer flex items-center justify-center gap-1"
                  disabled={cart.length === 0}
                  onClick={() => setSuspendLabel(`Hold ${suspendedSales.length + 1}`)}
                >
                  <Pause className="w-3 h-3" /> Suspend
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[360px] glass border-white/10 bg-background/95 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-sm">Suspend Current Sale</DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground">
                    Assign a label to hold this cart and complete it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-1">
                  <Label htmlFor="suspendLabel" className="text-xs">Hold Label</Label>
                  <Input
                    id="suspendLabel"
                    value={suspendLabel}
                    onChange={(e) => setSuspendLabel(e.target.value)}
                    placeholder="Table 4 / Customer A"
                    className="h-9 bg-white/5 border-white/10"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" className="h-8">Cancel</Button>
                  </DialogClose>
                  <Button variant="premiumGradient" size="sm" className="h-8 animate-pulse-glow" onClick={handleSuspendSale}>
                    Confirm Hold
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative text-xs h-8 px-2 flex items-center justify-center gap-1 cursor-pointer"
                  disabled={suspendedSales.length === 0}
                >
                  <Play className="w-3 h-3" /> Resume
                  {suspendedSales.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {suspendedSales.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] glass border-white/10 bg-background/95 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-sm">Suspended Carts</DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground">
                    Choose a suspended cart to restore to the active session.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                  {suspendedSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between border border-white/10 bg-white/3 p-2.5 rounded-lg text-xs">
                      <div>
                         <div className="font-semibold text-foreground">{sale.name}</div>
                         <div className="text-muted-foreground text-[10px]">{sale.cart.length} items · Held at {sale.createdAt}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] cursor-pointer"
                          onClick={() => handleResumeSale(sale)}
                        >
                          Resume
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] hover:text-destructive cursor-pointer"
                          onClick={() => setSuspendedSales(suspendedSales.filter(s => s.id !== sale.id))}
                        >
                          Discard
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calculations totals block */}
          <div className="px-5 py-3 border-t border-white/5 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            
            {lineDiscountsTotal > 0 && (
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Line Discounts</span>
                <span className="text-primary font-medium">-${lineDiscountsTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Order Discount</span>
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={orderDiscountType}
                  onChange={(e) => setOrderDiscountType(e.target.value as any)}
                  className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-foreground outline-none text-[10px]"
                >
                  <option value="fixed" className="bg-background">$ Off</option>
                  <option value="percentage" className="bg-background">% Off</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={orderDiscountValue || ""}
                  onChange={(e) => setOrderDiscountValue(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-14 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-foreground outline-none text-right text-[11px]"
                />
              </div>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-primary font-medium text-xs pt-0.5 animate-in">
                <span>Total Savings</span>
                <span>-${totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Taxes</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-display text-xl pt-1.5 border-t border-white/5 text-foreground">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {upsellProduct && (
            <div className="px-5 pb-3">
              <button 
                onClick={() => add(upsellProduct)}
                className="w-full text-left rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 animate-pulse" />
                <div className="text-xs">
                  <div className="text-foreground">AI suggestion: Add <span className="text-primary font-medium">{upsellProduct.name}</span></div>
                  <div className="text-muted-foreground">Frequently bought matching items. Tap to add.</div>
                </div>
              </button>
            </div>
          )}

          {/* 4-column payment mode selector */}
          <div className="px-5 pb-5">
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[
                { type: "cash" as const, i: Wallet, l: "Cash" },
                { type: "card" as const, i: CreditCard, l: "Card" },
                { type: "upi" as const, i: Smartphone, l: "UPI" },
                { type: "wallet" as const, i: Sparkles, l: "Wallet" },
              ].map((p) => (
                <button 
                  key={p.l} 
                  onClick={() => setPaymentMode(p.type)}
                  className={`h-12 rounded-xl border text-[10px] inline-flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    paymentMode === p.type ? "border-primary bg-primary/10 text-foreground" : "border-white/10 bg-white/3 hover:bg-white/6 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <p.i className="w-3.5 h-3.5" /> {p.l}
                </button>
              ))}
            </div>
            <button 
              disabled={isCheckingOut || cart.length === 0}
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      {/* Printable Thermal Slip Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[400px] glass border-white/10 bg-background/95 text-foreground max-h-[90vh] overflow-y-auto animate-in fade-in-50 duration-200">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Invoice Receipt
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Transaction completed successfully.
            </DialogDescription>
          </DialogHeader>

          {/* Thermal Slip Content */}
          <div id="thermal-receipt" className="border border-white/10 bg-white/3 rounded-xl p-5 font-mono text-xs text-foreground space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider">NexaStock POS Terminal</h2>
              <p className="text-[10px] text-muted-foreground">Store: {lastInvoice?.locationName || activeLocation?.name || "Acme Counter"}</p>
              <p className="text-[10px] text-muted-foreground">Code: {lastInvoice?.locationCode || activeLocation?.code || "ST-01"}</p>
            </div>

            <div className="border-t border-dashed border-white/10 pt-2 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span className="font-semibold">{lastInvoice?.invoiceNumber || "INV-000000"}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="uppercase">{lastInvoice?.paymentMode || paymentMode}</span>
              </div>
              {lastInvoice?.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{lastInvoice.customerName}</span>
                </div>
              )}
              {lastInvoice?.customerPhone && (
                <div className="flex justify-between">
                  <span>Cust Phone:</span>
                  <span>{lastInvoice.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Itemized Lines */}
            <div className="border-t border-dashed border-white/10 pt-2">
              <div className="grid grid-cols-[1fr_50px_60px] font-bold text-[10px] pb-1">
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="border-b border-dashed border-white/10 my-1"></div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lastInvoice?.lines?.map((line: any, idx: number) => (
                  <div key={idx} className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between font-medium">
                      <span>{line.name}</span>
                      <span>${line.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground pl-2">
                      <span>${line.price.toFixed(2)} × {line.qty}</span>
                      {line.discount > 0 && (
                        <span>Disc: -${line.discount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="border-t border-dashed border-white/10 pt-2.5 space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${lastInvoice?.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              {lastInvoice?.discountTotal > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Total Discounts</span>
                  <span>-${lastInvoice?.discountTotal?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Tax</span>
                <span>${lastInvoice?.taxTotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-dashed border-white/10 pt-2">
                <span>GRAND TOTAL</span>
                <span>${lastInvoice?.grandTotal?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-muted-foreground pt-3 border-t border-dashed border-white/10">
              Thank you for your purchase!
            </div>
          </div>

          <DialogFooter className="mt-4 pt-2 border-t border-white/5 flex gap-2 sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs flex-1 cursor-pointer">
                Close Slip
              </Button>
            </DialogClose>
            <Button
              onClick={handlePrintReceipt}
              variant="premiumGradient"
              className="h-9 text-xs flex-1 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse-glow"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
