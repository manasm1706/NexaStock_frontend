import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { motion } from "motion/react";

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

function Bars({ data, color = "from-primary to-accent" }: { data: { name: string; v: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{d.name}</span>
            <span className="text-foreground">{d.v}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.v / max) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full bg-gradient-to-r ${color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPage() {
  return (
    <DashboardLayout title="Analytics" subtitle="Network-wide performance · Last 30 days">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Revenue", v: "$4.82M", d: "+18.2%" },
          { l: "Units sold", v: "284,120", d: "+12.6%" },
          { l: "Avg basket", v: "$26.40", d: "+3.1%" },
          { l: "Stockout rate", v: "1.8%", d: "-0.6%" },
        ].map((k) => (
          <div key={k.l} className="glass rounded-2xl p-5 shadow-card">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{k.v}</div>
            <div className="text-xs text-success mt-2">{k.d}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Revenue trend</div>
            <div className="font-display text-lg">Last 12 weeks</div>
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
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="font-display text-lg">Revenue by category</div>
          <div className="text-xs text-muted-foreground mb-4">% of total</div>
          <Bars data={categories} />
        </div>
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="font-display text-lg">Revenue by region</div>
          <div className="text-xs text-muted-foreground mb-4">% of total</div>
          <Bars data={regions} color="from-accent to-primary" />
        </div>
      </div>
    </DashboardLayout>
  );
}
