import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { GlassCard, MetricCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { motion } from "motion/react";
import { Plus, Filter, Download, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useState } from "react";
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

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory · NexaStock" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedCat, setSelectedCat] = useState("All");
  const [open, setOpen] = useState(false);

  // Form states for adding product
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pharmacy");
  const [unitOfMeasure, setUnitOfMeasure] = useState("box");
  const [purchasePrice, setPurchasePrice] = useState("35");
  const [sellingPrice, setSellingPrice] = useState("48");
  const [reorderLevel, setReorderLevel] = useState("40");
  const [reorderQuantity, setReorderQuantity] = useState("200");
  const [industry, setIndustry] = useState("pharmacy");
  const [brand, setBrand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products and inventory balances
  const { data: productsData = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts()
  });

  const { data: balancesData = [], isLoading: loadingBalances } = useQuery({
    queryKey: ["inventory-balances"],
    queryFn: () => api.getInventoryBalances()
  });

  const isLoading = loadingProducts || loadingBalances;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !category || !unitOfMeasure || !purchasePrice || !sellingPrice || !reorderLevel || !reorderQuantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProduct({
        sku,
        name,
        category,
        unitOfMeasure,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        reorderLevel: Number(reorderLevel),
        reorderQuantity: Number(reorderQuantity),
        industry,
        brand: brand || undefined,
        taxRate: 12
      });

      toast.success("Product created successfully!");
      setOpen(false);
      // Reset form
      setSku("");
      setName("");
      setBrand("");
      
      // Invalidate queries to reload data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Inventory" subtitle="Loading catalog...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Map database products to the table requirements
  const mappedProducts = productsData.map((prod: any) => {
    const stock = balancesData
      .filter((bal: any) => bal.productId === prod.id)
      .reduce((sum: number, bal: any) => sum + bal.quantity, 0);

    let status = "healthy";
    if (stock === 0) {
      status = "out";
    } else if (stock <= prod.reorderLevel * 0.5) {
      status = "critical";
    } else if (stock <= prod.reorderLevel) {
      status = "low";
    }

    return {
      sku: prod.sku,
      name: prod.name,
      cat: prod.category,
      stock,
      min: prod.reorderLevel,
      price: prod.sellingPrice,
      status,
      trend: prod.metadata?.trend !== undefined ? Number(prod.metadata.trend) : 10
    };
  });

  // Calculate dynamic metrics
  const totalSKUs = productsData.length;
  
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  productsData.forEach((prod: any) => {
    const stock = balancesData
      .filter((bal: any) => bal.productId === prod.id)
      .reduce((sum: number, bal: any) => sum + bal.quantity, 0);

    totalValue += (prod.purchasePrice || 100) * stock;
    
    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= prod.reorderLevel) {
      lowStockCount++;
    }
  });

  const uniqueCats = ["All", ...Array.from(new Set(productsData.map((p: any) => p.category)))];

  const filteredProducts = mappedProducts.filter(
    (p: any) => selectedCat === "All" || p.cat === selectedCat
  );

  return (
    <DashboardLayout
      title="Inventory"
      subtitle={`Across ${totalSKUs} unique SKUs in network`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" className="h-9 px-3">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          <Button variant="outline" size="md" className="h-9 px-3">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="premiumGradient" size="md" className="h-9 px-4">
                <Plus className="w-3.5 h-3.5" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass border-white/10 bg-background/95 text-foreground max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Create a new SKU record in the central inventory directory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sku" className="text-xs">SKU Code</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MED-PARA-500" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Paracetamol 500mg" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-xs">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Pharmacy" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="uom" className="text-xs">Unit of Measure</Label>
                    <Input id="uom" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} placeholder="box" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="purchase" className="text-xs">Purchase Price ($)</Label>
                    <Input id="purchase" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="35" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="selling" className="text-xs">Selling Price ($)</Label>
                    <Input id="selling" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="48" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reorderPt" className="text-xs">Reorder Threshold</Label>
                    <Input id="reorderPt" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="40" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reorderQty" className="text-xs">Reorder Quantity</Label>
                    <Input id="reorderQty" type="number" value={reorderQuantity} onChange={(e) => setReorderQuantity(e.target.value)} placeholder="200" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="industry" className="text-xs">Industry</Label>
                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="pharmacy" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="brand" className="text-xs">Brand (Optional)</Label>
                    <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="GSK" className="h-9 bg-white/3 border-white/10 text-sm" />
                  </div>
                </div>

                <DialogFooter className="mt-4 pt-2 border-t border-white/5">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="h-9 text-xs">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="premiumGradient" className="h-9 text-xs" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { l: "Total SKUs", v: totalSKUs.toLocaleString(), d: "Active in directory" },
          { l: "Inventory value", v: `$${(totalValue / 1000).toFixed(1)}k`, d: "Cost-basis value" },
          { l: "Low stock", v: lowStockCount.toString(), d: "Threshold breached", warn: true },
          { l: "Out of stock", v: outOfStockCount.toString(), d: "Action required", danger: true },
        ].map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.45 }}
          >
            <MetricCard label={k.l} value={k.v} delta={k.d} className={k.danger ? "border-destructive/30" : k.warn ? "border-warning/30" : undefined} />
          </motion.div>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5">
          <div>
            <SectionTitle>Product catalog</SectionTitle>
            <div className="text-xs text-muted-foreground">Real-time stock across the network</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {uniqueCats.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedCat(t)}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  selectedCat === t ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <InventoryTable products={filteredProducts} />
      </GlassCard>
    </DashboardLayout>
  );
}
