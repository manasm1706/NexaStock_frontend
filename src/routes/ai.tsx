import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Brain, GitBranch, Wand2, Send, Zap } from "lucide-react";

export const Route = createFileRoute("/ai")({
  head: () => ({ meta: [{ title: "AI Center · NexaStock" }] }),
  component: AIPage,
});

const insights = [
  { tag: "Forecast", title: "Pantop-40 demand will rise 32% in West region", body: "Based on 12-week trend and seasonal pattern, reorder 400 units to Warehouse-West.", confidence: 94 },
  { tag: "Redistribute", title: "Move 50u Atorva-20 from Store B → Store C", body: "Store C will stock out in 9 days at current velocity. Store B has 2.4× surplus.", confidence: 91 },
  { tag: "Promote", title: "Slow-moving SKUs at Pune store", body: "8 SKUs aging >90 days. A bundled discount could recover ₹68k inventory value.", confidence: 86 },
  { tag: "Pricing", title: "Optimal price uplift on Telma-40: +6%", body: "Demand inelastic in cardiac category; competitor prices 8% higher.", confidence: 82 },
];

const agents = [
  { icon: Brain, name: "Forecast Agent", desc: "Predicts demand 30/60/90 days ahead", status: "Running" },
  { icon: GitBranch, name: "Redistribution Agent", desc: "Balances stock between locations", status: "Running" },
  { icon: Wand2, name: "Pricing Agent", desc: "Suggests optimal price points", status: "Paused" },
  { icon: Zap, name: "Reorder Agent", desc: "Auto-creates POs for vendors", status: "Running" },
];

function AIPage() {
  return (
    <DashboardLayout title="AI Center" subtitle="Your autonomous operations brain">
      {/* Hero ask bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 shadow-card relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Ask NexaStock AI
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-background/40 px-4 py-3">
            <input
              defaultValue="Which SKUs are most at risk of stocking out next week?"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              placeholder="Ask about demand, stock, pricing, vendors…"
            />
            <button className="h-8 px-3 text-xs rounded-lg bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground inline-flex items-center gap-1">
              Ask <Send className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Forecast Q3 demand for cardiac category",
              "Suggest transfers for Mumbai region",
              "Vendors with longest lead time",
              "Best price point for Telma-40",
            ].map((q) => (
              <button key={q} className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground">
                {q}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg">Active insights</div>
            <span className="text-xs text-muted-foreground">Updated 1 min ago · 12 new today</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {insights.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-5 shadow-card relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-primary">{it.tag}</span>
                  <span className="text-[10px] text-muted-foreground">conf. {it.confidence}%</span>
                </div>
                <div className="mt-2 font-medium leading-snug">{it.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">{it.body}</div>
                <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${it.confidence}%` }} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
                  <button className="text-xs inline-flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                    Apply <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="font-display text-lg">Autonomous agents</div>
          <div className="space-y-3">
            {agents.map((a) => (
              <div key={a.name} className="glass rounded-2xl p-4 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
                  <a.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                  a.status === "Running" ? "text-success bg-success/10 border-success/30" : "text-muted-foreground border-white/10"
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="mt-1 font-display text-base">NexaStock-Forecast v3.1</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[{ l: "MAPE", v: "4.8%" }, { l: "Coverage", v: "96%" }, { l: "Latency", v: "180ms" }].map((m) => (
                <div key={m.l} className="rounded-xl border border-white/10 bg-white/[0.02] py-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.l}</div>
                  <div className="text-sm font-medium mt-0.5">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
