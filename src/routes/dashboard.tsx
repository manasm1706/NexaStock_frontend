import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { motion } from "motion/react";
import { ArrowUpRight, TrendingUp, Package, AlertTriangle, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · NexaStock" }] }),
  component: DashboardPage,
});

function Sparkline({ color = "var(--primary)" }) {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8">
      <path d="M0,22 C15,18 25,24 40,14 C55,4 65,18 80,10 L100,6" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function DashboardPage() {
  const profile = authState.getProfile();
  const userName = profile?.fullName ? profile.fullName.split(" ")[0] : "Jane";

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getAnalyticsDashboard(),
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  const { data: aiInsights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => api.getAIInsights()
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Overview" subtitle={`Welcome back, ${userName}`} actions={<span className="text-xs text-muted-foreground">Loading dashboard...</span>}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-5 animate-pulse h-28">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-8 bg-white/10 rounded w-1/2 mt-4" />
            </GlassCard>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <GlassCard className="lg:col-span-2 p-6 animate-pulse h-80">
            <div />
          </GlassCard>
          <GlassCard className="p-6 animate-pulse h-80">
            <div />
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  // Map backend stats to KPI cards
  const revenueStr = dashboard?.revenue ? `$${Number(dashboard.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0";
  const invValueStr = dashboard?.inventoryValue ? `$${(Number(dashboard.inventoryValue) / 1000000).toFixed(2)}M` : "$0.00M";
  
  const kpis = [
    { label: "Revenue (MTD)", value: revenueStr, delta: "+12.4%", up: true },
    { label: "Active Stores", value: String(dashboard?.locations || 0), delta: "Synced", up: true },
    { label: "Inventory Value", value: invValueStr, delta: "Optimal", up: true },
    { label: "Low Stock Alert", value: String(dashboard?.lowStockAlerts || 0), delta: "Action needed", up: false },
  ];

  // Map recommendations
  const liveRecs = aiInsights?.recommendations?.map((text: string, index: number) => {
    const isReorder = text.toLowerCase().includes("reorder") || text.toLowerCase().includes("replenishment");
    return {
      tag: isReorder ? "Reorder" : "Redistribute",
      text,
      impact: isReorder ? "Suggested restocking" : "Avoid stockout"
    };
  }) || [
    { tag: "Redistribute", text: "Move 50u Atorva-20 · Store B → Store C", impact: "Avoid stockout · 9d" },
    { tag: "Reorder", text: "Pantop-40 trending +32% in West region", impact: "Suggested 400u" },
  ];

  // Map products
  const products = dashboard?.topProducts || [];

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`Welcome back, ${userName}`}
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" /> Live · synced just now
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <GlassCard key={k.label} className="p-5 relative overflow-hidden">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{k.value}</div>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${k.up ? "text-success" : "text-warning"}`}>{k.delta}</span>
              <Sparkline color={k.up ? "var(--primary)" : "var(--warning)"} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-6">
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
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><SectionTitle>AI Recommendations</SectionTitle></div>
          <div className="text-xs text-muted-foreground">Auto-generated · refreshed just now</div>
          <div className="mt-4 space-y-3">
            {liveRecs.map((r: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/3 p-4"
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
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg">Top Products</div>
            <Link to="/inventory" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <div className="mt-4 divide-y divide-white/5">
            {products.map((p: any) => (
              <div key={p.productId} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Package className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.productId}</div>
                </div>
                <div className="w-32 hidden sm:block"><Sparkline color="oklch(0.72 0.22 285)" /></div>
                <div className="text-right">
                  <div className="text-sm">{p.units.toLocaleString()} sold</div>
                  <div className="text-xs text-success inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +15%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="font-display text-lg">Alerts</div>
          <div className="text-xs text-muted-foreground">Actionable system warnings</div>
          <div className="mt-4 space-y-3 text-sm">
            {dashboard?.alerts?.map((a: any) => {
              const isWarning = a.severity === "warning";
              const isCritical = a.severity === "critical";
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/2 p-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-primary"}`} />
                  <div>
                    <div>{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.message}</div>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center py-6 text-xs text-muted-foreground">No active alerts</div>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
