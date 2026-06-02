import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { motion } from "motion/react";
import { Store, MapPin, TrendingUp, Plus } from "lucide-react";

export const Route = createFileRoute("/stores")({
  head: () => ({ meta: [{ title: "Stores · NexaStock" }] }),
  component: StoresPage,
});

const stores = [
  { name: "Andheri Warehouse", type: "Warehouse", city: "Mumbai", health: 96, revenue: "$184k", staff: 24 },
  { name: "Bandra Flagship", type: "Store", city: "Mumbai", health: 92, revenue: "$98k", staff: 12 },
  { name: "Pune Central", type: "Store", city: "Pune", health: 74, revenue: "$62k", staff: 8 },
  { name: "Koramangala", type: "Store", city: "Bengaluru", health: 88, revenue: "$112k", staff: 10 },
  { name: "Connaught Place", type: "Store", city: "Delhi", health: 91, revenue: "$148k", staff: 14 },
  { name: "Hyderabad Hub", type: "Warehouse", city: "Hyderabad", health: 89, revenue: "$132k", staff: 18 },
];

function StoresPage() {
  return (
    <DashboardLayout
      title="Stores & Warehouses"
      subtitle="148 locations · 6 regions"
      actions={
        <button className="h-9 px-4 rounded-xl text-sm inline-flex items-center gap-2 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm">
          <Plus className="w-3.5 h-3.5" /> Add location
        </button>
      }
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-5 shadow-card relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {s.city} · {s.type}
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                s.health >= 90 ? "text-success bg-success/10 border-success/30" :
                s.health >= 80 ? "text-warning bg-warning/10 border-warning/30" :
                "text-destructive bg-destructive/10 border-destructive/30"
              }`}>
                {s.health}%
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] py-2.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Revenue</div>
                <div className="text-sm font-medium mt-0.5">{s.revenue}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] py-2.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Staff</div>
                <div className="text-sm font-medium mt-0.5">{s.staff}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] py-2.5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trend</div>
                <div className="text-sm font-medium mt-0.5 text-success inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8%
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
