import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { AnalyticsBars } from "@/components/analytics/AnalyticsBars";
import { GlassCard, MetricCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState, getApiUrl } from "@/lib/api/client";
import { Loader2, Calendar, Download, RefreshCw, BarChart3, Package, Layers, MapPin, AlertTriangle, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useCurrency } from "@/hooks/useCurrency";

import { hasModulePermission } from "@/components/app/DashboardLayout";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · NexaStock" }] }),
  beforeLoad: ({ location }) => {
    if (!authState.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    const profile = authState.getProfile();
    const role = profile?.role || "";
    const permissions = profile?.effectivePermissions || [];

    if (!hasModulePermission("analytics", role, permissions)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AnalyticsPage,
});

type TabType = "overview" | "products" | "categories" | "inventory" | "export";
type TrendType = "daily" | "weekly" | "monthly";

function AnalyticsPage() {
  const queryClient = useQueryClient();
  const { format, formatCompact } = useCurrency();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [trendType, setTrendType] = useState<TrendType>("monthly");

  // Date filters state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Query analytics dashboard data
  const { data: dashboard, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => api.getAnalyticsDashboard(startDate || undefined, endDate || undefined),
  });

  const { data: productsData = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts()
  });

  const handleRefresh = async () => {
    toast.promise(
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }).then(() => refetch()),
      {
        loading: "Refetching analytics records...",
        success: "Analytics ledger synced successfully!",
        error: "Failed to refresh analytics ledger."
      }
    );
  };

  // Helper to trigger authenticated CSV download
  const handleExport = async (reportType: "revenue" | "products" | "inventory") => {
    const token = authState.getToken();
    const tenantId = authState.getTenantId();
    if (!token || !tenantId) {
      toast.error("Authentication session expired. Please login again.");
      return;
    }

    const exportPromise = async () => {
      const url = `${getApiUrl()}/analytics/export?reportType=${reportType}`;
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": tenantId
        }
      });

      if (!res.ok) {
        throw new Error("Export download failed");
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    };

    toast.promise(exportPromise(), {
      loading: `Generating and downloading ${reportType} report...`,
      success: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded!`,
      error: `Failed to export ${reportType} report.`
    });
  };

  // Calculations
  const stockoutRateStr = useMemo(() => {
    if (productsData.length === 0 || !dashboard) return "0.0%";
    const outOfStockCount = dashboard.inventoryMetrics?.outOfStockItems || 0;
    const rate = (outOfStockCount / productsData.length) * 100;
    return `${rate.toFixed(1)}%`;
  }, [productsData, dashboard]);

  // SVG Trend Path Calculation
  const trendSvgContent = useMemo(() => {
    if (!dashboard?.revenueTrends) return { path: "", area: "", points: [] };
    const pointsData = dashboard.revenueTrends[trendType] || [];
    if (pointsData.length === 0) return { path: "", area: "", points: [] };

    const maxVal = Math.max(...pointsData.map((p: any) => p.value), 1000);
    const width = 800;
    const height = 220;
    const paddingX = 40;
    const paddingY = 25;

    const mapped = pointsData.map((p: any, idx: number) => {
      const x = pointsData.length > 1
        ? (idx / (pointsData.length - 1)) * (width - paddingX * 2) + paddingX
        : width / 2;
      const y = height - paddingY - (p.value / maxVal) * (height - paddingY * 2);
      return { x, y, value: p.value, label: p.date };
    });

    let path = "";
    let area = "";

    if (mapped.length > 0) {
      path = `M ${mapped[0].x} ${mapped[0].y}`;
      for (let i = 1; i < mapped.length; i++) {
        path += ` L ${mapped[i].x} ${mapped[i].y}`;
      }

      area = `${path} L ${mapped[mapped.length - 1].x} ${height - paddingY} L ${mapped[0].x} ${height - paddingY} Z`;
    }

    return { path, area, points: mapped };
  }, [dashboard, trendType]);

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="Gathering analytics ledger...">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Re-aggregating transaction history...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard values
  const kpis = [
    { label: "Today's Revenue", value: format(dashboard?.revenueMetrics?.today || 0, 2), delta: "Live" },
    { label: "Week Revenue", value: format(dashboard?.revenueMetrics?.week || 0, 0), delta: "Trailing 7d" },
    { label: "Month Revenue", value: format(dashboard?.revenueMetrics?.month || 0, 0), delta: "MTD" },
    { label: "Year Revenue", value: format(dashboard?.revenueMetrics?.year || 0, 0), delta: "YTD" },
    { label: "Total Orders", value: (dashboard?.salesMetrics?.totalOrders || 0).toLocaleString(), delta: "Month" },
    { label: "Avg Basket Value", value: format(dashboard?.salesMetrics?.averageOrderValue || 0, 2), delta: "Per sale" },
    { label: "Units Sold", value: (dashboard?.salesMetrics?.unitsSold || 0).toLocaleString(), delta: "Month" },
    { label: "Stockout Rate", value: stockoutRateStr, delta: "Active catalog", danger: true }
  ];

  return (
    <DashboardLayout
      title="Analytics Dashboard"
      subtitle="Data-driven reporting, margins, velocity, and region distributions"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 border border-white/10 rounded-xl px-2.5 py-1.5 bg-white/3 text-xs">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground w-24 [color-scheme:dark]"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground w-24 [color-scheme:dark]"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="text-[10px] text-primary hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition text-xs font-medium bg-white/3 text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            Refresh
          </button>
        </div>
      }
    >
      {/* Sub-navigation tabs */}
      <div className="flex border-b border-white/5 pb-0 mb-6 overflow-x-auto gap-1">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "products", label: "Product Performance", icon: Package },
          { id: "categories", label: "Categories & Regions", icon: Layers },
          { id: "inventory", label: "Inventory Alerts", icon: AlertTriangle },
          { id: "export", label: "Export Reports", icon: Download }
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k) => (
                  <MetricCard
                    key={k.label}
                    label={k.label}
                    value={k.value}
                    delta={k.delta}
                    className={k.danger && parseFloat(k.value) > 10 ? "border-destructive/30 text-destructive" : undefined}
                  />
                ))}
              </div>

              {/* Trend Chart */}
              <GlassCard className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Revenue aggregate timeline</div>
                    <SectionTitle>Sales Trend Curve</SectionTitle>
                  </div>
                  <div className="flex border border-white/10 rounded-lg p-0.5 bg-white/3 text-xs w-fit">
                    {[
                      { id: "daily", label: "Daily (30d)" },
                      { id: "weekly", label: "Weekly (12w)" },
                      { id: "monthly", label: "Monthly (12m)" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setTrendType(btn.id as TrendType)}
                        className={`px-3 py-1 rounded-md font-semibold transition ${
                          trendType === btn.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Graph Drawing */}
                <div className="relative">
                  {trendSvgContent.points.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">No completed sales recorded for trend periods</div>
                  ) : (
                    <>
                      <svg viewBox="0 0 800 240" className="w-full h-56 mt-4">
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line key={i} x1="40" x2="760" y1={44 * i + 25} y2={44 * i + 25} stroke="white" strokeOpacity="0.05" />
                        ))}
                        {/* Render Area */}
                        <path d={trendSvgContent.area} fill="url(#trendGrad)" />
                        {/* Render Line */}
                        <path d={trendSvgContent.path} stroke="oklch(0.82 0.16 258)" strokeWidth="2.5" fill="none" />
                        {/* Render dots and tooltips */}
                        {trendSvgContent.points.map((p: any, idx: number) => (
                          <g key={idx} className="group/dot">
                            <circle cx={p.x} cy={p.y} r="3.5" fill="oklch(0.82 0.16 258)" className="hover:r-5 cursor-pointer transition-all" />
                            <circle cx={p.x} cy={p.y} r="8" fill="oklch(0.82 0.16 258)" fillOpacity="0" className="cursor-pointer" />
                            {/* Hover tooltip */}
                            <foreignObject x={p.x - 45} y={p.y - 45} width="90" height="35" className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <div className="bg-background/95 border border-white/15 rounded px-1.5 py-0.5 text-[10px] text-center text-foreground font-mono shadow-lg">
                                ${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                            </foreignObject>
                          </g>
                        ))}
                      </svg>
                      {/* X Axis Labels */}
                      <div className="flex justify-between px-10 text-[9px] text-muted-foreground font-mono mt-1">
                        {trendSvgContent.points.filter((_: any, i: number) => trendType === "daily" ? i % 4 === 0 : true).map((p: any, idx: number) => (
                          <span key={idx} style={{ width: "60px", textAlign: "center" }}>{p.label}</span>
                        ))}
                      </div>
                    </>
                  )}

                </div>
              </GlassCard>

              {/* Store Performance */}
              <div className="grid lg:grid-cols-2 gap-4">
                <GlassCard className="p-6">
                  <SectionTitle>Store Performance</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">Total revenue breakdown by counter store</div>
                  {dashboard?.storePerformance?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No completed store transactions</div>
                  ) : (
                    <div className="space-y-4">
                      {dashboard?.storePerformance?.map((store: any) => {
                        const totalRev = dashboard.revenueMetrics?.month || 1;
                        const percent = Math.min(100, Math.max(0, (store.value / totalRev) * 100));
                        return (
                          <div key={store.name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{store.name}</span>
                              <span className="font-mono font-medium">{format(store.value)}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-semibold">Ledger Safe</span>
                  </div>
                  <SectionTitle>Data Source Integrity</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">Verification logs mapping database references</div>
                  <div className="space-y-3.5 text-xs">
                    {[
                      { ref: "Sale", count: (dashboard?.salesMetrics?.totalOrders || 0), desc: "Completed sales records mapped" },
                      { ref: "Inventory", count: (productsData.length || 0), desc: "Catalog active products resolved" },
                      { ref: "Alerts", count: (dashboard?.alerts?.length || 0), desc: "Live triggers monitoring stockout bounds" }
                    ].map((item) => (
                      <div key={item.ref} className="flex items-start gap-3 border border-white/5 bg-white/1 rounded-xl p-3">
                        <div className="font-mono text-primary font-semibold w-20">{item.ref}</div>
                        <div className="flex-1">
                          <div className="text-foreground font-medium">{item.count} entries</div>
                          <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </>
          )}

          {/* TAB 2: PRODUCT PERFORMANCE */}
          {activeTab === "products" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Selling Cards */}
              <GlassCard className="p-6 space-y-4">
                <SectionTitle>Top Performing Products</SectionTitle>
                <div className="text-xs text-muted-foreground">By monthly revenue contribution</div>
                <div className="divide-y divide-white/5">
                  {dashboard?.productPerformance?.topSellingByRev?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No completed product sales</div>
                  ) : (
                    dashboard?.productPerformance?.topSellingByRev?.map((prod: any) => (
                      <div key={prod.productId} className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-semibold">{prod.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{prod.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-semibold">{format(prod.revenue)}</div>
                          <div className="text-[10px] text-success font-medium">{prod.units} units sold</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <SectionTitle>Top Selling by Units</SectionTitle>
                <div className="text-xs text-muted-foreground">By quantity units checked out</div>
                <div className="divide-y divide-white/5">
                  {dashboard?.productPerformance?.topSellingByQty?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No completed product sales</div>
                  ) : (
                    dashboard?.productPerformance?.topSellingByQty?.map((prod: any) => (
                      <div key={prod.productId} className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-semibold">{prod.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{prod.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{prod.units} units</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{format(prod.revenue, 0)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Velocity Indicators */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Fast Moving</span>
                </div>
                <SectionTitle>Sales Velocity (Fast)</SectionTitle>
                <div className="text-xs text-muted-foreground">Avg units sold per day (last 30 days)</div>
                <div className="divide-y divide-white/5">
                  {dashboard?.productPerformance?.fastMoving?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No fast moving products identified</div>
                  ) : (
                    dashboard?.productPerformance?.fastMoving?.map((prod: any) => (
                      <div key={prod.productId} className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-semibold">{prod.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{prod.sku} · Stock: {prod.qtyOnHand}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-success font-semibold">+{prod.velocity.toFixed(2)}/day</div>
                          <div className="text-[10px] text-muted-foreground">{prod.unitsSold} units total</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Slow Moving</span>
                </div>
                <SectionTitle>Sales Velocity (Slow)</SectionTitle>
                <div className="text-xs text-muted-foreground">Products in stock (qty &gt; 0) with low movement</div>
                <div className="divide-y divide-white/5">
                  {dashboard?.productPerformance?.slowMoving?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No slow moving products identified</div>
                  ) : (
                    dashboard?.productPerformance?.slowMoving?.map((prod: any) => (
                      <div key={prod.productId} className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-semibold">{prod.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{prod.sku} · Stock: {prod.qtyOnHand}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-warning font-semibold">{prod.velocity.toFixed(3)}/day</div>
                          <div className="text-[10px] text-muted-foreground">{prod.unitsSold} units total</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Worst Performing products */}
              <GlassCard className="lg:col-span-2 p-6 space-y-4">
                <SectionTitle>Worst Performing Products</SectionTitle>
                <div className="text-xs text-muted-foreground">Lowest revenue generators (includes unsold items)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                        <th className="py-2.5">SKU</th>
                        <th className="py-2.5">Product Name</th>
                        <th className="py-2.5 text-right">Units Sold</th>
                        <th className="py-2.5 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dashboard?.productPerformance?.worstPerformingByRev?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-muted-foreground">No records found</td>
                        </tr>
                      ) : (
                        dashboard?.productPerformance?.worstPerformingByRev?.map((prod: any) => (
                          <tr key={prod.productId} className="hover:bg-white/1">
                            <td className="py-3 font-mono text-muted-foreground">{prod.sku}</td>
                            <td className="py-3 font-medium text-foreground">{prod.name}</td>
                            <td className="py-3 text-right font-mono">{prod.units}</td>
                            <td className="py-3 text-right font-mono font-semibold">{format(prod.revenue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 3: CATEGORIES & REGIONS */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                  <SectionTitle>Revenue by Category</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">% share of monthly checkout revenues</div>
                  {dashboard?.categoryAnalytics?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground font-mono">No categories data</div>
                  ) : (
                    <AnalyticsBars 
                      data={dashboard.categoryAnalytics.map((c: any) => {
                        const total = dashboard.revenueMetrics?.month || 1;
                        const share = Math.round((c.revenue / total) * 100);
                        return { name: c.name, v: share };
                      })} 
                    />
                  )}
                </GlassCard>

                <GlassCard className="p-6">
                  <SectionTitle>Revenue by Region</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">Geographic store locations distribution share</div>
                  {dashboard?.regionalAnalytics?.revenueByRegion?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground font-mono">No regional distribution data</div>
                  ) : (
                    <AnalyticsBars 
                      data={dashboard.regionalAnalytics.revenueByRegion.map((r: any) => {
                        const total = dashboard.revenueMetrics?.month || 1;
                        const share = Math.round((r.value / total) * 100);
                        return { name: r.name, v: share };
                      })} 
                      color="from-accent to-primary" 
                    />
                  )}
                </GlassCard>
              </div>

              {/* Warehouse stock contributions */}
              <div className="grid lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-6">
                  <SectionTitle>Category Drill-Down Valuation</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">Revenues and valuation grouped by inventory category</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                          <th className="py-2.5 text-left font-sans">Category Name</th>
                          <th className="py-2.5 text-right">Revenue (MTD)</th>
                          <th className="py-2.5 text-right">Units Mapped</th>
                          <th className="py-2.5 text-right">Inventory Cost Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboard?.categoryAnalytics?.map((cat: any) => (
                          <tr key={cat.name} className="hover:bg-white/1">
                            <td className="py-3 font-sans font-medium text-foreground">{cat.name}</td>
                            <td className="py-3 text-right">{format(cat.revenue, 0)}</td>
                            <td className="py-3 text-right">{cat.unitsSold} units</td>
                            <td className="py-3 text-right">{format(cat.inventoryValue, 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <SectionTitle>Warehouse Valuation Contribution</SectionTitle>
                  <div className="text-xs text-muted-foreground mb-4">Current inventory valuation by physical warehouse hub</div>
                  {dashboard?.warehouseContribution?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">No active warehouse balances</div>
                  ) : (
                    <div className="space-y-4">
                      {dashboard?.warehouseContribution?.map((wh: any) => {
                        const totalVal = dashboard.inventoryMetrics?.inventoryValue || 1;
                        const percent = Math.min(100, Math.max(0, (wh.value / totalVal) * 100));
                        return (
                          <div key={wh.name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">{wh.name}</span>
                              <span className="font-mono text-muted-foreground">{format(wh.value, 0)}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY ALERTS */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Turnover Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <GlassCard className="p-5">
                  <div className="text-xs text-muted-foreground">Cost of Goods Sold (30d)</div>
                  <div className="mt-2 font-display text-2xl font-semibold font-mono text-foreground">
                    ${(dashboard?.inventoryAnalytics?.turnover?.cogs || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">Deducted inventory acquisition cost</div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="text-xs text-muted-foreground">Current Valued Stock</div>
                  <div className="mt-2 font-display text-2xl font-semibold font-mono text-foreground">
                    ${(dashboard?.inventoryAnalytics?.turnover?.avgInventoryValue || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">Average asset valuation</div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="text-xs text-muted-foreground">Stock Turnover Ratio (30d)</div>
                  <div className="mt-2 font-display text-2xl font-semibold font-mono text-primary">
                    {(dashboard?.inventoryAnalytics?.turnover?.ratio || 0).toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">Higher multiplier indicates faster rotations</div>
                </GlassCard>
              </div>

              {/* Low Stock alerts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <SectionTitle>Low Stock Dashboard</SectionTitle>
                  </div>
                  <div className="text-xs text-muted-foreground">Items currently below location threshold reorder levels</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground">
                          <th className="py-2 font-semibold">Product</th>
                          <th className="py-2">Location</th>
                          <th className="py-2 text-right">Available</th>
                          <th className="py-2 text-right">Reorder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboard?.inventoryAnalytics?.lowStock?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-muted-foreground text-xs font-mono">All stock levels healthy</td>
                          </tr>
                        ) : (
                          dashboard?.inventoryAnalytics?.lowStock?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/1">
                              <td className="py-2.5">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-[9px] text-muted-foreground font-mono">{item.sku}</div>
                              </td>
                              <td className="py-2.5 text-muted-foreground">{item.locationName}</td>
                              <td className="py-2.5 text-right font-mono text-warning font-semibold">{item.qtyOnHand}</td>
                              <td className="py-2.5 text-right font-mono text-muted-foreground">{item.reorderLevel}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>

                {/* Dead Stock alerts */}
                <GlassCard className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <SectionTitle>Dead Stock Analysis</SectionTitle>
                  </div>
                  <div className="text-xs text-muted-foreground">Active inventory (qty &gt; 0) with zero sales in the last 30 days</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground">
                          <th className="py-2 font-semibold">Product Name</th>
                          <th className="py-2">Active Location</th>
                          <th className="py-2 text-right">Held Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboard?.inventoryAnalytics?.deadStock?.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-6 text-muted-foreground text-xs font-mono">No dead stock detected</td>
                          </tr>
                        ) : (
                          dashboard?.inventoryAnalytics?.deadStock?.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/1">
                              <td className="py-2.5">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-[9px] text-muted-foreground font-mono">{item.sku}</div>
                              </td>
                              <td className="py-2.5 text-muted-foreground">{item.locationName}</td>
                              <td className="py-2.5 text-right font-mono font-semibold">{item.qtyOnHand}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 5: EXPORT REPORTS */}
          {activeTab === "export" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-semibold">Authorized Exports Audit</span>
                </div>
                <SectionTitle>Generate Legal Compliance Reports</SectionTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export transactional database records directly into CSV spreadsheets. All generated files contain structured audit headers (Timestamp, Authorized Tenant, and MD5 record mapping identifiers) for business ledger verification.
                </p>
              </GlassCard>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    type: "revenue",
                    title: "Revenue Ledger Report",
                    desc: "Lists completed invoice sales, date indexes, sub-totals, margins, and checkout payment mode identifiers.",
                  },
                  {
                    type: "products",
                    title: "Product Performance",
                    desc: "Aggregates monthly itemized units checked out, prices, and revenue margins per active catalog SKU.",
                  },
                  {
                    type: "inventory",
                    title: "Inventory Valuation",
                    desc: "Retrieves active warehouses and stores stock quantities, reorder thresholds, and current cost valuation.",
                  }
                ].map((rep) => (
                  <GlassCard key={rep.type} className="p-5 flex flex-col justify-between h-56">
                    <div className="space-y-2">
                      <div className="text-xs text-primary font-semibold uppercase tracking-widest">{rep.type}</div>
                      <div className="text-sm font-semibold">{rep.title}</div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{rep.desc}</p>
                    </div>

                    <button
                      onClick={() => handleExport(rep.type as any)}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold active:scale-97 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CSV
                    </button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
