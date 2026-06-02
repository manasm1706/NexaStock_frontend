import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { motion } from "motion/react";
import { Plus, Filter, Download, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory · NexaStock" }] }),
  component: InventoryPage,
});

const products = [
  { sku: "ATR-020", name: "Atorva-20", cat: "Cardiac", stock: 1284, min: 400, status: "healthy", price: 142, trend: 18 },
  { sku: "PNT-040", name: "Pantop-40", cat: "Gastro", stock: 96, min: 250, status: "low", price: 88, trend: 12 },
  { sku: "GLM-002", name: "Glimer-2", cat: "Diabetes", stock: 812, min: 300, status: "healthy", price: 64, trend: 9 },
  { sku: "TLM-040", name: "Telma-40", cat: "Cardiac", stock: 32, min: 200, status: "critical", price: 110, trend: -4 },
  { sku: "CRC-001", name: "Crocin Adv.", cat: "OTC", stock: 1500, min: 500, status: "healthy", price: 28, trend: 4 },
  { sku: "AZE-500", name: "Azee-500", cat: "Antibiotic", stock: 220, min: 300, status: "low", price: 96, trend: 6 },
  { sku: "DLX-30", name: "Duloxe-30", cat: "Neuro", stock: 480, min: 200, status: "healthy", price: 175, trend: 11 },
  { sku: "MTF-500", name: "Metformin-500", cat: "Diabetes", stock: 0, min: 400, status: "out", price: 22, trend: -12 },
];

const statusStyle: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  low: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  out: "bg-muted text-muted-foreground border-white/10",
};

function InventoryPage() {
  return (
    <DashboardLayout
      title="Inventory"
      subtitle="Across 148 stores · 12,840 SKUs"
      actions={
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-xl glass text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="h-9 px-3 rounded-xl glass text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button className="h-9 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm">
            <Plus className="w-3.5 h-3.5" /> Add product
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Total SKUs", v: "12,840", d: "+128 this week" },
          { l: "Inventory value", v: "$8.42M", d: "+4.2%" },
          { l: "Low stock", v: "84", d: "Across 22 stores", warn: true },
          { l: "Out of stock", v: "12", d: "Action needed", danger: true },
        ].map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.45 }}
            className="glass rounded-2xl p-5 shadow-card"
          >
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{k.v}</div>
            <div className={`text-xs mt-2 ${k.danger ? "text-destructive" : k.warn ? "text-warning" : "text-success"}`}>{k.d}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <div className="font-display text-lg">Product catalog</div>
            <div className="text-xs text-muted-foreground">Real-time stock across the network</div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {["All", "Cardiac", "Diabetes", "OTC", "Antibiotic"].map((t, i) => (
              <button key={t} className={`px-2.5 py-1 rounded-lg ${i === 0 ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-white/[0.02]">
              <tr>
                <th className="text-left font-medium px-5 py-3">Product</th>
                <th className="text-left font-medium px-5 py-3">Category</th>
                <th className="text-right font-medium px-5 py-3">Stock</th>
                <th className="text-right font-medium px-5 py-3">Reorder pt.</th>
                <th className="text-right font-medium px-5 py-3">Price</th>
                <th className="text-right font-medium px-5 py-3">Trend</th>
                <th className="text-center font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.cat}</td>
                  <td className="px-5 py-3 text-right font-mono">{p.stock.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{p.min}</td>
                  <td className="px-5 py-3 text-right">${p.price}</td>
                  <td className={`px-5 py-3 text-right ${p.trend >= 0 ? "text-success" : "text-destructive"}`}>
                    <span className="inline-flex items-center gap-1">
                      {p.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {p.trend > 0 ? "+" : ""}{p.trend}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${statusStyle[p.status]}`}>
                      {p.status === "out" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
