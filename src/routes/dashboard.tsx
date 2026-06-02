import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { motion } from "motion/react";
import { ArrowUpRight, TrendingUp, Package, AlertTriangle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · NexaStock" }] }),
  component: DashboardPage,
});

const kpis = [
  { label: "Revenue (MTD)", value: "$1,425,820", delta: "+12.4%", up: true },
  { label: "Active Stores", value: "148", delta: "+6 this month", up: true },
  { label: "Inventory Health", value: "92%", delta: "Optimal", up: true },
  { label: "AI Confidence", value: "94%", delta: "High", up: true },
];

const recs = [
  { tag: "Redistribute", text: "Move 50u Atorva-20 · Store B → Store C", impact: "Avoid stockout · 9d" },
  { tag: "Reorder", text: "Pantop-40 trending +32% in West region", impact: "Suggested 400u" },
  { tag: "Promote", text: "Slow-moving SKUs at Pune store", impact: "Recover ₹68k" },
];

const topProducts = [
  { name: "Atorva-20", sku: "ATR-020", sold: 1284, trend: "+18%" },
  { name: "Pantop-40", sku: "PNT-040", sold: 996, trend: "+12%" },
  { name: "Glimer-2", sku: "GLM-002", sold: 812, trend: "+9%" },
  { name: "Telma-40", sku: "TLM-040", sold: 740, trend: "+6%" },
  { name: "Crocin Adv.", sku: "CRC-001", sold: 690, trend: "+4%" },
];

function Sparkline({ color = "var(--primary)" }) {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8">
      <path d="M0,22 C15,18 25,24 40,14 C55,4 65,18 80,10 L100,6" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function DashboardPage() {
  return (
    <DashboardLayout
      title="Overview"
      subtitle="Welcome back, Jane"
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" /> Live · synced 2s ago
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-5 shadow-card relative overflow-hidden"
          >
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{k.value}</div>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${k.up ? "text-success" : "text-destructive"}`}>{k.delta}</span>
              <Sparkline />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Revenue & Demand Forecast</div>
              <div className="font-display text-lg mt-1">Next 30 days</div>
            </div>
            <div className="flex gap-1 text-xs">
              {["7d", "30d", "90d"].map((t, i) => (
                <button key={t} className={`px-2.5 py-1 rounded-lg ${i === 1 ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"}`}>{t}</button>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 800 240" className="w-full h-64 mt-4">
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.22 285)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="oklch(0.62 0.22 285)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" x2="800" y1={48 * i + 20} y2={48 * i + 20} stroke="white" strokeOpacity="0.05" />
            ))}
            <path d="M0,180 C60,160 110,170 160,140 C220,100 280,130 340,90 C400,55 460,80 520,60 C580,40 640,70 700,50 L800,38 L800,240 L0,240 Z" fill="url(#rev)" />
            <path d="M0,180 C60,160 110,170 160,140 C220,100 280,130 340,90 C400,55 460,80 520,60 C580,40 640,70 700,50 L800,38" stroke="oklch(0.82 0.16 258)" strokeWidth="2.2" fill="none" />
            <path d="M0,200 C60,185 110,190 160,170 C220,145 280,160 340,130 C400,100 460,118 520,100 C580,80 640,98 700,82 L800,72 L800,240 L0,240 Z" fill="url(#fc)" />
            <path d="M0,200 C60,185 110,190 160,170 C220,145 280,160 340,130 C400,100 460,118 520,100 C580,80 640,98 700,82 L800,72" stroke="oklch(0.72 0.22 285)" strokeWidth="2" fill="none" strokeDasharray="5 4" />
          </svg>
          <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Revenue</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" />AI Forecast</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><div className="font-display text-lg">AI Recommendations</div></div>
          <div className="text-xs text-muted-foreground">Auto-generated · refreshed 1m ago</div>
          <div className="mt-4 space-y-3">
            {recs.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-primary">{r.tag}</div>
                <div className="text-sm mt-1.5 text-foreground">{r.text}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{r.impact}</span>
                  <button className="inline-flex items-center gap-1 text-xs text-foreground hover:text-primary">Apply <ArrowUpRight className="w-3 h-3" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg">Top products</div>
            <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {topProducts.map((p) => (
              <div key={p.sku} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Package className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sku}</div>
                </div>
                <div className="w-32 hidden sm:block"><Sparkline color="oklch(0.72 0.22 285)" /></div>
                <div className="text-right">
                  <div className="text-sm">{p.sold.toLocaleString()}</div>
                  <div className="text-xs text-success inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" />{p.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="font-display text-lg">Alerts</div>
          <div className="text-xs text-muted-foreground">Across 148 stores</div>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { i: AlertTriangle, c: "text-warning", t: "12 SKUs low on stock", s: "4 stores affected" },
              { i: Package, c: "text-primary", t: "3 transfers awaiting approval", s: "Warehouse · Andheri" },
              { i: TrendingUp, c: "text-success", t: "Mumbai region +38% WoW", s: "Apparel category" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <a.i className={`w-4 h-4 mt-0.5 ${a.c}`} />
                <div>
                  <div>{a.t}</div>
                  <div className="text-xs text-muted-foreground">{a.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
