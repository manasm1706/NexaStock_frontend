import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, Brain, GitBranch, Wand2, Send, Zap, Loader2, AlertTriangle, ShieldCheck, HelpCircle, TrendingUp, TrendingDown, ArrowUpRight, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ai")({
  head: () => ({ meta: [{ title: "AI Center · NexaStock" }] }),
  beforeLoad: ({ location }) => {
    if (!authState.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AIPage,
});

type AISubTab = "insights" | "reorders" | "forecasts";

const agents = [
  { icon: Brain, name: "Forecast Agent", desc: "Predicts demand 7/30 days ahead", status: "Running" },
  { icon: GitBranch, name: "Redistribution Agent", desc: "Balances stock between locations", status: "Running" },
  { icon: Wand2, name: "Pricing Agent", desc: "Suggests markdown values", status: "Paused" },
  { icon: Zap, name: "Reorder Agent", desc: "Calculates reorder values", status: "Running" },
];

function AIPage() {
  const [activeTab, setActiveTab] = useState<AISubTab>("insights");

  // Query state
  const [queryInput, setQueryInput] = useState("");
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [queryType, setQueryType] = useState<string | null>(null);
  const [queryData, setQueryData] = useState<any[] | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Load backend AI insights data
  const { data: aiInsights, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => api.getAIInsights()
  });

  const handleAskQuery = async (text: string) => {
    if (!text.trim()) return;
    setIsQuerying(true);
    setQueryInput(text);
    try {
      const res = await api.askAIQuery(text);
      setQueryAnswer(res.answer);
      setQueryType(res.queryType);
      setQueryData(res.data || null);
    } catch (err: any) {
      toast.error(err.message || "Failed to process AI query");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleApplyRecommendation = (recTitle: string) => {
    toast.success(`Action applied: ${recTitle}`);
  };

  // Circular progress stroke calculation
  const strokeDashoffset = useMemo(() => {
    const score = aiInsights?.inventoryHealth?.score ?? 0;
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  }, [aiInsights]);

  if (isLoading) {
    return (
      <DashboardLayout title="AI Center" subtitle="Accessing model...">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Accessing neural copilot ledger...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Priority color classes helper
  const getPriorityBadge = (priority: string) => {
    const label = priority.toUpperCase();
    if (label === "CRITICAL") return "text-destructive border-destructive/20 bg-destructive/10";
    if (label === "HIGH") return "text-warning border-warning/20 bg-warning/10";
    if (label === "MEDIUM") return "text-primary border-primary/20 bg-primary/10";
    return "text-muted-foreground border-white/10 bg-white/3";
  };

  return (
    <DashboardLayout 
      title="AI Center" 
      subtitle="Your data-driven autonomous retail operations brain"
      actions={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" /> Refreshed just now
        </div>
      }
    >
      {/* Top Section: NL Search box and health snapshot */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* NL Query Box */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                  <Sparkles className="w-4 h-4" /> Ask NexaStock Copilot
                </div>
                {queryAnswer && (
                  <button 
                    onClick={() => { setQueryAnswer(null); setQueryData(null); setQueryInput(""); }}
                    className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Clear Results
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/40 px-3.5 py-2.5">
                <input
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuery(queryInput)}
                  className="bg-transparent outline-none text-xs sm:text-sm flex-1 placeholder:text-muted-foreground text-foreground"
                  placeholder="Ask about stockouts, reorders, pricing, best stores..."
                />
                <Button 
                  onClick={() => handleAskQuery(queryInput)}
                  disabled={isQuerying}
                  variant="premiumGradient" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                >
                  {isQuerying ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Ask <Send className="w-3 h-3" /></>}
                </Button>
              </div>

              {/* Suggestions Chips (User Addition 5) */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "What products are low in stock?",
                  "What should I reorder?",
                  "Which store performs best?",
                  "Show dead stock items",
                ].map((q) => (
                  <button 
                    key={q} 
                    onClick={() => handleAskQuery(q)}
                    className="text-[10px] px-2.5 py-1.5 rounded-full border border-white/10 bg-white/3 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Drawer */}
            <AnimatePresence mode="wait">
              {queryAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 border border-white/10 rounded-xl bg-white/2 p-4 space-y-3 text-xs animate-in"
                >
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Brain className="w-3.5 h-3.5" /> Mapped Copilot Response
                  </div>
                  <div className="text-foreground leading-relaxed font-sans">{queryAnswer}</div>
                  
                  {/* Query Result Table */}
                  {queryData && queryData.length > 0 && (
                    <div className="overflow-x-auto max-h-48 mt-2 rounded-lg border border-white/5 bg-background/30">
                      <table className="w-full text-[10px] text-left border-collapse font-mono">
                        <thead>
                          <tr className="border-b border-white/10 text-muted-foreground bg-white/2 font-semibold">
                            <th className="p-2 text-left font-sans">Identifier / Name</th>
                            <th className="p-2 text-right">Details</th>
                            <th className="p-2 text-right">Metric</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {queryData.map((row: any, idx: number) => {
                            // Mapped displays based on response types
                            const name = row.name || "N/A";
                            const detail = row.sku || row.code || row.location || "N/A";
                            const metric = row.qtyOnHand !== undefined ? `${row.qtyOnHand} units`
                                         : row.revenue !== undefined ? `$${row.revenue.toLocaleString()}`
                                         : row.stock !== undefined ? `${row.stock} units`
                                         : row.qtyOnHand !== undefined ? `${row.qtyOnHand} units`
                                         : "N/A";
                            return (
                              <tr key={idx} className="hover:bg-white/3">
                                <td className="p-2 font-sans font-medium text-foreground">{name}</td>
                                <td className="p-2 text-right text-muted-foreground">{detail}</td>
                                <td className="p-2 text-right text-primary font-semibold">{metric}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Health Score snapshot */}
        <div>
          <GlassCard className="p-5 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Inventory Health</div>
                <div className="text-lg font-semibold mt-0.5 text-foreground">
                  {aiInsights?.inventoryHealth?.status || "Good"}
                </div>
              </div>
              
              {/* Visual Health Gauge Dial */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" stroke="white" strokeOpacity="0.05" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="35" 
                    stroke="oklch(0.66 0.22 258)" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 35}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold font-mono">
                  {aiInsights?.inventoryHealth?.score ?? 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div className="border border-white/5 bg-white/1 p-2 rounded-lg">
                <div className="text-[9px] text-muted-foreground font-sans">Stockouts</div>
                <div className="text-sm font-semibold mt-0.5 text-foreground">{aiInsights?.inventoryHealth?.stockoutsCount || 0}</div>
              </div>
              <div className="border border-white/5 bg-white/1 p-2 rounded-lg">
                <div className="text-[9px] text-muted-foreground font-sans">Dead Stock</div>
                <div className="text-sm font-semibold mt-0.5 text-foreground">{aiInsights?.inventoryHealth?.deadStockCount || 0}</div>
              </div>
              <div className="border border-white/5 bg-white/1 p-2 rounded-lg">
                <div className="text-[9px] text-muted-foreground font-sans">Overstocks</div>
                <div className="text-sm font-semibold mt-0.5 text-foreground">{aiInsights?.inventoryHealth?.overstockCount || 0}</div>
              </div>
              <div className="border border-white/5 bg-white/1 p-2 rounded-lg">
                <div className="text-[9px] text-muted-foreground font-sans">Turnover Rate</div>
                <div className="text-sm font-semibold mt-0.5 text-primary">{(aiInsights?.inventoryHealth?.turnoverRatio || 0).toFixed(2)}x</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Executive Summary */}
      <GlassCard className="p-4 border-primary/20 bg-primary/3">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Automatic Executive Summary</div>
            <p className="text-xs sm:text-sm text-foreground leading-relaxed leading-6 font-sans">
              {aiInsights?.executiveSummary || "System calculations currently re-indexing ledger status..."}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-white/5 pb-0 overflow-x-auto gap-1">
        {[
          { id: "insights", label: "Active Suggestions", icon: Sparkles },
          { id: "reorders", label: "Reorder Planner", icon: Zap },
          { id: "forecasts", label: "Demand Projections", icon: Brain }
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as AISubTab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                active 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/3"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {/* TAB 1: ACTIVE INSIGHTS */}
          {activeTab === "insights" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recommendations list */}
              <div className="lg:col-span-2 space-y-4">
                <SectionTitle>Real Recommendations</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-4">
                  {aiInsights?.recommendations?.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-xs text-muted-foreground font-mono">No open recommendations generated</div>
                  ) : (
                    aiInsights?.recommendations?.map((it: any) => (
                      <GlassCard key={it.id} className="p-5 flex flex-col justify-between h-64 border-white/10 hover:border-primary/20 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{it.tag}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">Confidence: {it.confidence}%</span>
                          </div>
                          <div className="text-sm font-semibold leading-snug text-foreground">{it.title}</div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">{it.body}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2 bg-white/2 border border-white/5 p-2 rounded-lg leading-relaxed">
                            <Info className="w-3 h-3 text-primary shrink-0" />
                            <span>{it.reasoning}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-xs">
                          {/* Priority badge */}
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${getPriorityBadge(it.priority)}`}>
                            {it.priority}
                          </span>
                          
                          <button 
                            onClick={() => handleApplyRecommendation(it.title)}
                            className="inline-flex items-center gap-1 text-primary hover:text-primary-foreground hover:bg-primary/10 px-2 py-1 rounded transition text-xs"
                          >
                            Apply <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Agent status & model metrics */}
              <div className="space-y-4">
                <SectionTitle>Agent Telemetry</SectionTitle>
                <div className="space-y-3">
                  {agents.map((a) => (
                    <GlassCard key={a.name} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 border border-white/5 flex items-center justify-center shrink-0">
                        <a.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{a.desc}</div>
                      </div>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border font-semibold ${
                        a.status === "Running" ? "text-success bg-success/5 border-success/20" : "text-muted-foreground border-white/10"
                      }`}>
                        {a.status}
                      </span>
                    </GlassCard>
                  ))}
                </div>

                {/* Store MoM Performance */}
                <GlassCard className="p-4 space-y-3">
                  <SectionTitle>Store Performance MoM Shift</SectionTitle>
                  {aiInsights?.storePerformance?.insights?.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-muted-foreground">Re-aggregating locations...</div>
                  ) : (
                    <div className="space-y-2 text-xs font-mono text-muted-foreground leading-relaxed">
                      {aiInsights?.storePerformance?.insights?.map((ins: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-start bg-white/2 p-2 rounded-lg border border-white/5">
                          <span className="text-primary shrink-0 mt-0.5">·</span>
                          <span className="font-sans text-[11px] text-foreground">{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 2: REORDER RECOMMENDATIONS */}
          {activeTab === "reorders" && (
            <GlassCard className="p-6 space-y-4">
              <div>
                <SectionTitle>Reorder Planner Recommendations</SectionTitle>
                <p className="text-xs text-muted-foreground">Suggested restocking quantities mapped dynamically against safety stock level limits</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                      <th className="py-2.5">SKU / Product</th>
                      <th className="py-2.5 text-right">In Stock</th>
                      <th className="py-2.5 text-right">Daily Velocity</th>
                      <th className="py-2.5 text-right">Days Left</th>
                      <th className="py-2.5 text-right">Suggested PO</th>
                      <th className="py-2.5 text-center">Priority</th>
                      <th className="py-2.5 text-right">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {aiInsights?.reorders?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground font-mono">No items currently require restocking</td>
                      </tr>
                    ) : (
                      aiInsights?.reorders?.map((item: any) => (
                        <tr key={item.productId} className="hover:bg-white/1 text-foreground">
                          <td className="py-3 pr-2">
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{item.sku}</div>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold">{item.currentStock} units</td>
                          <td className="py-3 text-right font-mono">{item.avgDailySales.toFixed(1)}/day</td>
                          <td className="py-3 text-right font-mono">
                            <span className={item.daysRemaining <= 5 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                              {item.daysRemaining} days
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono text-primary font-semibold">+{item.suggestedQty} units</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${getPriorityBadge(item.priority)}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-left text-muted-foreground text-[10px] leading-relaxed max-w-xs">{item.reasoning}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* TAB 3: DEMAND FORECASTING */}
          {activeTab === "forecasts" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Product Forecasts */}
              <GlassCard className="p-6 space-y-4">
                <SectionTitle>Product Demand Projections</SectionTitle>
                <div className="text-xs text-muted-foreground mb-2">Trend-based projections including lower and upper confidence bands</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                        <th className="py-2.5">Product Name</th>
                        <th className="py-2.5 text-right font-mono">MTD Demand</th>
                        <th className="py-2.5 text-right font-mono">7d Forecast</th>
                        <th className="py-2.5 text-right font-mono">30d Forecast (Range)</th>
                        <th className="py-2.5 text-center">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {aiInsights?.forecasts?.filter((f: any) => f.entityType === "product").length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-muted-foreground font-mono">No data points resolved</td>
                        </tr>
                      ) : (
                        aiInsights?.forecasts?.filter((f: any) => f.entityType === "product").map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/1">
                            <td className="py-3 font-semibold pr-2">{item.entityName}</td>
                            <td className="py-3 text-right font-mono">{item.currentDemand} units</td>
                            <td className="py-3 text-right font-mono text-primary font-semibold">~{item.forecast7d}</td>
                            <td className="py-3 text-right font-mono text-foreground font-medium">
                              ~{item.forecast30d} <span className="text-[9px] text-muted-foreground font-normal">({item.lowerBound30d}–{item.upperBound30d})</span>
                            </td>
                            <td className="py-3 text-center">
                              {item.trend === "Increasing" ? (
                                <span className="inline-flex items-center gap-0.5 text-success font-semibold"><TrendingUp className="w-3 h-3" /> Inc</span>
                              ) : item.trend === "Decreasing" ? (
                                <span className="inline-flex items-center gap-0.5 text-warning font-semibold"><TrendingDown className="w-3 h-3" /> Dec</span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-muted-foreground font-semibold">Stable</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Category Forecasts */}
              <GlassCard className="p-6 space-y-4">
                <SectionTitle>Category Demand Projections</SectionTitle>
                <div className="text-xs text-muted-foreground mb-2">Aggregate projections grouped by item category</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                        <th className="py-2.5">Category Name</th>
                        <th className="py-2.5 text-right font-mono">MTD Demand</th>
                        <th className="py-2.5 text-right font-mono">7d Forecast</th>
                        <th className="py-2.5 text-right font-mono">30d Forecast (Range)</th>
                        <th className="py-2.5 text-center">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {aiInsights?.forecasts?.filter((f: any) => f.entityType === "category").length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-muted-foreground font-mono">No data points resolved</td>
                        </tr>
                      ) : (
                        aiInsights?.forecasts?.filter((f: any) => f.entityType === "category").map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/1">
                            <td className="py-3 font-semibold pr-2">{item.entityName}</td>
                            <td className="py-3 text-right font-mono">{item.currentDemand} units</td>
                            <td className="py-3 text-right font-mono text-primary font-semibold">~{item.forecast7d}</td>
                            <td className="py-3 text-right font-mono text-foreground font-medium">
                              ~{item.forecast30d} <span className="text-[9px] text-muted-foreground font-normal">({item.lowerBound30d}–{item.upperBound30d})</span>
                            </td>
                            <td className="py-3 text-center">
                              {item.trend === "Increasing" ? (
                                <span className="inline-flex items-center gap-0.5 text-success font-semibold"><TrendingUp className="w-3 h-3" /> Inc</span>
                              ) : item.trend === "Decreasing" ? (
                                <span className="inline-flex items-center gap-0.5 text-warning font-semibold"><TrendingDown className="w-3 h-3" /> Dec</span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-muted-foreground font-semibold">Stable</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
