import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowUpRight, TrendingUp, Package, AlertTriangle, Sparkles, 
  Settings2, LayoutGrid, Check, Plus, Trash2, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight, RotateCcw, Copy
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · NexaStock" }] }),
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
  component: DashboardPage,
});

function Sparkline({ color = "var(--primary)" }) {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8">
      <path d="M0,22 C15,18 25,24 40,14 C55,4 65,18 80,10 L100,6" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

interface WidgetConfig {
  id: string;
  size: "sm" | "md" | "lg";
  visible: boolean;
}

interface LayoutConfig {
  name: string;
  widgets: WidgetConfig[];
}

function getWidgetName(id: string): string {
  const names: Record<string, string> = {
    revenue: "Revenue (MTD)",
    stores: "Active Stores",
    inventoryValue: "Inventory Asset Value",
    lowStock: "Low Stock Alert",
    forecastChart: "Demand Forecast Chart",
    aiInsights: "AI Recommendations",
    topProducts: "Top Selling Products",
    alerts: "Compliance Alerts"
  };
  return names[id] || id;
}

function getWidgetSizeClass(size: "sm" | "md" | "lg") {
  if (size === "sm") return "col-span-1";
  if (size === "md") return "col-span-1 md:col-span-2";
  return "col-span-1 md:col-span-2 lg:col-span-4";
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const profile = authState.getProfile();
  const userName = profile?.fullName ? profile.fullName.split(" ")[0] : "Jane";

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  
  // Custom layouts states
  const [localLayouts, setLocalLayouts] = useState<LayoutConfig[]>([]);
  const [localActiveLayoutName, setLocalActiveLayoutName] = useState<string>("");

  // API Queries
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getAnalyticsDashboard(),
    refetchInterval: 15000
  });

  const { data: aiInsights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => api.getAIInsights()
  });

  const { data: workspaceSettings } = useQuery({
    queryKey: ["workspace-settings"],
    queryFn: () => api.getWorkspaceSettings(),
    staleTime: 5 * 60 * 1000
  });

  // Load layout configuration when settings are fetched
  useEffect(() => {
    if (workspaceSettings) {
      setLocalLayouts(workspaceSettings.dashboardLayouts || []);
      setLocalActiveLayoutName(workspaceSettings.activeLayoutName || "Default Layout");
    }
  }, [workspaceSettings]);

  if (loadingDashboard || !workspaceSettings) {
    return (
      <DashboardLayout title="Overview" subtitle={`Welcome back, ${userName}`} actions={<span className="text-xs text-muted-foreground">Loading workspace configurations...</span>}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-5 animate-pulse h-28">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-8 bg-white/10 rounded w-1/2 mt-4" />
            </GlassCard>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const currentLayout = localLayouts.find(l => l.name === localActiveLayoutName) || {
    name: "Default Layout",
    widgets: [
      { id: "revenue", size: "sm" as const, visible: true },
      { id: "stores", size: "sm" as const, visible: true },
      { id: "inventoryValue", size: "sm" as const, visible: true },
      { id: "lowStock", size: "sm" as const, visible: true },
      { id: "forecastChart", size: "md" as const, visible: true },
      { id: "aiInsights", size: "sm" as const, visible: true },
      { id: "topProducts", size: "md" as const, visible: true },
      { id: "alerts", size: "sm" as const, visible: true }
    ]
  };

  // KPI mapping
  const revenueStr = dashboard?.revenue ? `$${Number(dashboard.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0";
  const invValueStr = dashboard?.inventoryValue ? `$${(Number(dashboard.inventoryValue) / 1000000).toFixed(2)}M` : "$0.00M";

  const liveRecs = aiInsights?.recommendations?.map((rec: any) => {
    const textVal = typeof rec === "string" ? rec : (rec?.title || rec?.body || rec?.description || "");
    const tagVal = typeof rec === "string" ? null : rec?.tag;
    const isReorder = 
      String(tagVal || "").toLowerCase().includes("reorder") || 
      textVal.toLowerCase().includes("reorder") || 
      textVal.toLowerCase().includes("replenishment");
    return {
      tag: tagVal || (isReorder ? "Reorder" : "Redistribute"),
      text: textVal,
      impact: isReorder ? "Suggested restocking" : "Avoid stockout"
    };
  }) || [
    { tag: "Redistribute", text: "Move 50u Atorva-20 · Store B → Store C", impact: "Avoid stockout · 9d" },
    { tag: "Reorder", text: "Pantop-40 trending +32% in West region", impact: "Suggested 400u" },
  ];

  const products = dashboard?.topProducts || [];

  // Drag and Drop implementation
  const handleWidgetDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleWidgetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleWidgetDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const widgetsCopy = [...currentLayout.widgets];
    const draggedIdx = widgetsCopy.findIndex(w => w.id === draggedWidgetId);
    const targetIdx = widgetsCopy.findIndex(w => w.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = widgetsCopy.splice(draggedIdx, 1);
    widgetsCopy.splice(targetIdx, 0, removed);

    const updatedLayouts = localLayouts.map(l => {
      if (l.name === localActiveLayoutName) {
        return { ...l, widgets: widgetsCopy };
      }
      return l;
    });

    setLocalLayouts(updatedLayouts);
    setDraggedWidgetId(null);
  };

  // Reorder fallback buttons
  const moveWidget = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLayout.widgets.length) return;

    const widgetsCopy = [...currentLayout.widgets];
    const temp = widgetsCopy[index];
    widgetsCopy[index] = widgetsCopy[targetIndex];
    widgetsCopy[targetIndex] = temp;

    setLocalLayouts(localLayouts.map(l => {
      if (l.name === localActiveLayoutName) {
        return { ...l, widgets: widgetsCopy };
      }
      return l;
    }));
  };

  // Sizing controls
  const toggleWidgetSize = (id: string) => {
    const sizes: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"];
    const widgetsCopy = currentLayout.widgets.map(w => {
      if (w.id === id) {
        const nextIdx = (sizes.indexOf(w.size) + 1) % sizes.length;
        return { ...w, size: sizes[nextIdx] };
      }
      return w;
    });

    setLocalLayouts(localLayouts.map(l => {
      if (l.name === localActiveLayoutName) {
        return { ...l, widgets: widgetsCopy };
      }
      return l;
    }));
  };

  // Visibility toggle
  const toggleWidgetVisibility = (id: string, visible: boolean) => {
    const widgetsCopy = currentLayout.widgets.map(w => {
      if (w.id === id) {
        return { ...w, visible };
      }
      return w;
    });

    setLocalLayouts(localLayouts.map(l => {
      if (l.name === localActiveLayoutName) {
        return { ...l, widgets: widgetsCopy };
      }
      return l;
    }));
  };

  // Save changes to API
  const handleSaveLayout = async () => {
    try {
      const updatedSettings = {
        ...workspaceSettings,
        dashboardLayouts: localLayouts,
        activeLayoutName: localActiveLayoutName
      };
      await api.updateWorkspaceSettings(updatedSettings);
      queryClient.setQueryData(["workspace-settings"], updatedSettings);
      setIsEditing(false);
      toast.success("Dashboard layout saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save dashboard settings");
    }
  };

  // Reset to default template
  const handleResetLayout = async () => {
    if (!confirm("Are you sure you want to reset this layout to default card alignments?")) return;
    try {
      const updatedSettings = {
        ...workspaceSettings,
        dashboardLayouts: undefined,
        activeLayoutName: undefined
      };
      await api.updateWorkspaceSettings(updatedSettings);
      queryClient.invalidateQueries({ queryKey: ["workspace-settings"] });
      setIsEditing(false);
      toast.success("Layout reset to template defaults.");
    } catch (err: any) {
      toast.error("Failed to reset dashboard");
    }
  };

  // Switch layouts
  const handleSwitchLayout = (name: string) => {
    setLocalActiveLayoutName(name);
    // Auto save active layout choice
    const updatedSettings = {
      ...workspaceSettings,
      activeLayoutName: name
    };
    api.updateWorkspaceSettings(updatedSettings).then(() => {
      queryClient.setQueryData(["workspace-settings"], updatedSettings);
      toast.info(`Switched dashboard view: ${name}`);
    });
  };

  // Duplicate layout
  const handleDuplicateLayout = () => {
    const newName = prompt("Enter a unique name for your duplicated dashboard variant:", `${localActiveLayoutName} (Copy)`);
    if (!newName || !newName.trim()) return;
    
    const trimmed = newName.trim();
    if (localLayouts.some(l => l.name === trimmed)) {
      toast.error("A layout with this name already exists.");
      return;
    }

    const duplicated = {
      name: trimmed,
      widgets: [...currentLayout.widgets]
    };

    const newLayouts = [...localLayouts, duplicated];
    setLocalLayouts(newLayouts);
    setLocalActiveLayoutName(trimmed);
    
    const updatedSettings = {
      ...workspaceSettings,
      dashboardLayouts: newLayouts,
      activeLayoutName: trimmed
    };
    api.updateWorkspaceSettings(updatedSettings).then(() => {
      queryClient.setQueryData(["workspace-settings"], updatedSettings);
      toast.success(`Duplicated layout created: ${trimmed}`);
    });
  };

  const hiddenWidgets = currentLayout.widgets.filter(w => !w.visible);
  const visibleWidgets = currentLayout.widgets.filter(w => w.visible);

  return (
    <DashboardLayout
      title="Overview"
      subtitle={`Welcome back, ${userName}`}
      actions={
        <div className="flex items-center gap-3">
          {/* Active layout switcher */}
          {!isEditing && (
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={localActiveLayoutName}
                onChange={(e) => handleSwitchLayout(e.target.value)}
                className="h-8 rounded-lg border border-white/10 bg-black/20 text-xs px-2 outline-none cursor-pointer"
              >
                {localLayouts.map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold active:scale-95 transition bg-white/3 text-foreground ${
              isEditing ? "border-primary text-primary" : "border-white/10 hover:bg-white/5"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            {isEditing ? "Editing Dashboard" : "Customize Widgets"}
          </button>
        </div>
      }
    >
      {/* 🛠️ EDITOR CONTROL BOARD */}
      {isEditing && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4 shadow-premium">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">Dashboard Widgets Customizer</h3>
                <p className="text-[11px] text-muted-foreground">Adjust panel order, resize widgets, or toggle layout configurations.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleDuplicateLayout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium transition active:scale-95">
                <Copy className="w-3 h-3" /> Duplicate Layout
              </button>
              <button onClick={handleResetLayout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-warning/10 text-warning hover:text-warning text-xs font-medium transition active:scale-95">
                <RotateCcw className="w-3 h-3" /> Reset Template
              </button>
              <button onClick={handleSaveLayout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold transition active:scale-95">
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition active:scale-95">
                Cancel
              </button>
            </div>
          </div>

          {hiddenWidgets.length > 0 && (
            <div className="border-t border-white/5 pt-3">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Available widgets to add:</div>
              <div className="flex gap-2 flex-wrap">
                {hiddenWidgets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => toggleWidgetVisibility(w.id, true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/2 hover:bg-white/10 border border-white/5 text-xs font-medium transition-all"
                  >
                    <Plus className="w-3 h-3 text-success" />
                    {getWidgetName(w.id)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎛️ DYNAMIC WIDGET GRID CANVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentLayout.widgets.map((widget, index) => {
          if (!widget.visible) return null;
          const sizeClass = getWidgetSizeClass(widget.size);

          return (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
              onDragOver={handleWidgetDragOver}
              onDrop={(e) => handleWidgetDrop(e, widget.id)}
              className={`${sizeClass} relative transition-all duration-300`}
            >
              {/* Customizer Border Overlay when editing */}
              {isEditing && (
                <div className="absolute inset-0 bg-primary/2 rounded-2xl border-2 border-primary/20 border-dashed pointer-events-none z-10 animate-pulse-glow" />
              )}

              {/* Individual Widget Canvas Wrapper */}
              <div className="relative group/widget h-full">
                {/* WIDGET EDITOR PANEL HEADER */}
                {isEditing && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl px-2 py-1 flex items-center gap-2 z-20 shadow-lg transition-opacity">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mr-1">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    
                    <button 
                      onClick={() => moveWidget(index, "left")} 
                      disabled={index === 0} 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => moveWidget(index, "right")} 
                      disabled={index === currentLayout.widgets.length - 1} 
                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => toggleWidgetSize(widget.id)}
                      title={`Size: ${widget.size.toUpperCase()}`}
                      className="text-[10px] font-mono px-1 bg-white/10 hover:bg-white/20 rounded text-primary font-bold transition-all uppercase"
                    >
                      {widget.size}
                    </button>

                    <button
                      onClick={() => toggleWidgetVisibility(widget.id, false)}
                      title="Hide Widget"
                      className="text-destructive hover:text-red-400 p-0.5 rounded transition"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* RENDER ACTUAL COMPONENT */}
                {renderWidgetContent(widget.id, dashboard, liveRecs, products)}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

// Sub-render method to isolate specific metrics logic
function renderWidgetContent(id: string, dashboard: any, liveRecs: any[], products: any[]): ReactNode {
  switch (id) {
    case "revenue":
      return (
        <GlassCard className="p-5 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Revenue (MTD)</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {dashboard?.revenue ? `$${Number(dashboard.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "$0"}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-success">+12.4%</span>
            <Sparkline color="var(--primary)" />
          </div>
        </GlassCard>
      );
    case "stores":
      return (
        <GlassCard className="p-5 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Active Stores</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {String(dashboard?.locations || 0)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-success">Synced</span>
            <Sparkline color="var(--primary)" />
          </div>
        </GlassCard>
      );
    case "inventoryValue":
      return (
        <GlassCard className="p-5 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Inventory Asset Value</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {dashboard?.inventoryValue ? `$${(Number(dashboard.inventoryValue) / 1000000).toFixed(2)}M` : "$0.00M"}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-success">Optimal</span>
            <Sparkline color="var(--primary)" />
          </div>
        </GlassCard>
      );
    case "lowStock":
      return (
        <GlassCard className="p-5 relative overflow-hidden h-full flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Low Stock Alert</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-warning">
              {String(dashboard?.lowStockAlerts || 0)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-warning">Action needed</span>
            <Sparkline color="var(--warning)" />
          </div>
        </GlassCard>
      );
    case "forecastChart":
      return (
        <GlassCard className="p-6 h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Revenue & Demand Forecast</div>
              <div className="font-display text-lg mt-1 font-semibold">Next 30 days</div>
            </div>
            <div className="flex gap-1 text-xs">
              {["7d", "30d", "90d"].map((t, i) => (
                <button key={t} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${i === 1 ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5"}`}>{t}</button>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 800 240" className="w-full h-56 mt-4">
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
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground mt-2 font-semibold">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Revenue</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" />AI Forecast</span>
          </div>
        </GlassCard>
      );
    case "aiInsights":
      return (
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><SectionTitle>AI Recommendations</SectionTitle></div>
          <div className="text-xs text-muted-foreground mt-0.5">Auto-generated · refreshed just now</div>
          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-72">
            {liveRecs.map((r: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/3 p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">{r.tag}</div>
                <div className="text-xs mt-1.5 text-foreground leading-relaxed">{r.text}</div>
                <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
                  <span className="text-[10px] text-muted-foreground">{r.impact}</span>
                  <button className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold">
                    Apply <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      );
    case "topProducts":
      return (
        <GlassCard className="p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Top Products</SectionTitle>
            <Link to="/inventory" className="text-xs text-muted-foreground hover:text-foreground hover:underline font-semibold">View all</Link>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto pr-1">
            {products.map((p: any) => (
              <div key={p.productId} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">{p.productId}</div>
                </div>
                <div className="w-32 hidden sm:block shrink-0"><Sparkline color="oklch(0.72 0.22 285)" /></div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-medium text-foreground">{p.units.toLocaleString()} sold</div>
                  <div className="text-[10px] text-success inline-flex items-center gap-0.5 font-semibold mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +15%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      );
    case "alerts":
      return (
        <GlassCard className="p-6 h-full flex flex-col">
          <SectionTitle>System Alerts</SectionTitle>
          <div className="text-xs text-muted-foreground mt-0.5">Actionable warnings</div>
          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
            {dashboard?.alerts?.map((a: any) => {
              const isWarning = a.severity === "warning";
              const isCritical = a.severity === "critical";
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/2 p-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-primary"}`} />
                  <div className="text-xs">
                    <div className="font-semibold text-foreground">{a.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{a.message}</div>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center py-12 text-xs text-muted-foreground font-mono">No active alerts</div>
            )}
          </div>
        </GlassCard>
      );
    default:
      return null;
  }
}
