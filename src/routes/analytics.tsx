import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { AnalyticsBars } from "@/components/analytics/AnalyticsBars";
import { GlassCard, MetricCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · NexaStock" }] }),
  component: AnalyticsPage,
});

const categories = [
  { name: "Cardiac", v: 38 },
  { name: "Diabetes", v: 26 },
  { name: "OTC", v: 18 },
  { name: "Antibiotic", v: 12 },
  { name: "Neuro", v: 6 },
];

const regions = [
  { name: "West", v: 42 }, { name: "South", v: 26 }, { name: "North", v: 20 }, { name: "East", v: 12 },
];

function AnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getAnalyticsDashboard()
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Gathering analytics ledger...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate dynamic display values from backend dashboard data
  const liveRevenue = dashboard?.revenue !== undefined ? `$${Number(dashboard.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$4.82M";

  return (
    <DashboardLayout title="Analytics" subtitle="Network-wide performance · Last 30 days">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Revenue", v: liveRevenue, d: "+18.2%" },
          { l: "Units sold", v: "284,120", d: "+12.6%" },
          { l: "Avg basket", v: "$26.40", d: "+3.1%" },
          { l: "Stockout rate", v: "1.8%", d: "-0.6%" },
        ].map((k) => (
          <MetricCard key={k.l} label={k.l} value={k.v} delta={k.d} />
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Revenue trend</div>
            <SectionTitle>Last 12 weeks</SectionTitle>
          </div>
        </div>
        <svg viewBox="0 0 800 220" className="w-full h-56 mt-4">
          <defs>
            <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" x2="800" y1={44 * i + 16} y2={44 * i + 16} stroke="white" strokeOpacity="0.05" />
          ))}
          <path d="M0,170 C60,150 110,160 160,130 C220,90 280,120 340,80 C400,45 460,70 520,55 C580,35 640,60 700,42 L800,30 L800,220 L0,220 Z" fill="url(#rev2)" />
          <path d="M0,170 C60,150 110,160 160,130 C220,90 280,120 340,80 C400,45 460,70 520,55 C580,35 640,60 700,42 L800,30" stroke="oklch(0.82 0.16 258)" strokeWidth="2.2" fill="none" />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={i * 72 + 24} cy={170 - i * 11 + (i % 2 === 0 ? 8 : -4)} r="3" fill="oklch(0.82 0.16 258)" />
          ))}
        </svg>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <SectionTitle>Revenue by category</SectionTitle>
          <div className="text-xs text-muted-foreground mb-4">% of total</div>
          <AnalyticsBars data={categories} />
        </GlassCard>
        <GlassCard className="p-6">
          <SectionTitle>Revenue by region</SectionTitle>
          <div className="text-xs text-muted-foreground mb-4">% of total</div>
          <AnalyticsBars data={regions} color="from-accent to-primary" />
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
