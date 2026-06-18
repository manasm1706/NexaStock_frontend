import { Link, useRouterState } from "@tanstack/react-router";
import { LogoMark, Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import {
  LayoutDashboard, Boxes, Brain, Store, BarChart3, Settings,
  ScanLine, Sparkles, Search, Bell, Edit, Eye, EyeOff, Star, GripVertical, ChevronUp, ChevronDown, Lock, RotateCcw
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api, authState } from "@/lib/api/client";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { getBusinessType } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Static mapping of modules
export const MODULE_REGISTRY: Record<string, { to: string; icon: any; label: string }> = {
  dashboard: { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  inventory: { to: "/inventory", icon: Boxes, label: "Inventory" },
  ai: { to: "/ai", icon: Brain, label: "AI Center" },
  stores: { to: "/stores", icon: Store, label: "Stores" },
  pos: { to: "/pos", icon: ScanLine, label: "POS" },
  analytics: { to: "/analytics", icon: BarChart3, label: "Analytics" },
  settings: { to: "/settings", icon: Settings, label: "Settings" }
};

// Check if a role is permitted to see a module
export function hasModulePermission(moduleId: string, role: string): boolean {
  if (role === "super_admin" || role === "business_owner") return true;
  if (moduleId === "dashboard" || moduleId === "settings") return true;
  
  if (role === "operations_manager" || role === "store_manager") {
    return true;
  }
  if (role === "cashier") {
    return moduleId === "pos" || moduleId === "inventory";
  }
  if (role === "warehouse_manager") {
    return moduleId === "inventory" || moduleId === "stores";
  }
  return false;
}

export function DashboardLayout({
  title, subtitle, actions, children,
}: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingSidebar, setIsEditingSidebar] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Queries
  const { data: tenantData } = useQuery({
    queryKey: ["tenant-summary"],
    queryFn: () => api.getTenantSummary(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: workspaceSettings } = useQuery({
    queryKey: ["workspace-settings"],
    queryFn: () => api.getWorkspaceSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const bizType = getBusinessType(tenantData?.tenant?.industry);
  const profile = authState.getProfile();
  const userRole = profile?.role || "";

  const userInitials = profile?.fullName
    ? profile.fullName
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "JD";

  // Sidebar parameters falling back to role-based list if undefined
  const sidebarOrder: string[] = workspaceSettings?.sidebarOrder || [
    "dashboard", "inventory", "ai", "stores", "pos", "analytics", "settings"
  ];
  const sidebarFavorites: string[] = workspaceSettings?.sidebarFavorites || [];
  const sidebarHidden: string[] = workspaceSettings?.sidebarHidden || [];

  const updateWorkspaceMutation = async (newSettings: any) => {
    try {
      await api.updateWorkspaceSettings(newSettings);
      queryClient.setQueryData(["workspace-settings"], newSettings);
      toast.success("Navigation preferences saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update navigation settings");
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isLocked(sidebarOrder[index])) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    if (isLocked(sidebarOrder[targetIndex])) return;

    const newOrder = [...sidebarOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    const updated = {
      ...workspaceSettings,
      sidebarOrder: newOrder
    };
    updateWorkspaceMutation(updated);
    setDraggedIndex(null);
  };

  const isLocked = (modId: string) => {
    return !hasModulePermission(modId, userRole);
  };

  // Up/down reordering accessibility fallback
  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sidebarOrder.length) return;
    if (isLocked(sidebarOrder[index]) || isLocked(sidebarOrder[targetIndex])) return;

    const newOrder = [...sidebarOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    updateWorkspaceMutation({
      ...workspaceSettings,
      sidebarOrder: newOrder
    });
  };

  // Visibility toggle
  const toggleVisibility = (modId: string) => {
    if (isLocked(modId)) return;
    let newHidden = [...sidebarHidden];
    if (newHidden.includes(modId)) {
      newHidden = newHidden.filter(h => h !== modId);
    } else {
      newHidden.push(modId);
    }
    updateWorkspaceMutation({
      ...workspaceSettings,
      sidebarHidden: newHidden
    });
  };

  // Favorites toggle
  const toggleFavorite = (modId: string) => {
    if (isLocked(modId)) return;
    let newFavs = [...sidebarFavorites];
    if (newFavs.includes(modId)) {
      newFavs = newFavs.filter(f => f !== modId);
    } else {
      newFavs.push(modId);
    }
    updateWorkspaceMutation({
      ...workspaceSettings,
      sidebarFavorites: newFavs
    });
  };

  // Reset navigation layout
  const resetWorkspace = async () => {
    if (!confirm("Are you sure you want to reset all navigation personalization settings?")) return;
    try {
      await api.updateWorkspaceSettings({});
      queryClient.invalidateQueries({ queryKey: ["workspace-settings"] });
      toast.success("Workspace layout has been reset to defaults.");
    } catch (err: any) {
      toast.error("Failed to reset layout");
    }
  };

  // Filter modules to display
  const allowedSidebarOrder = sidebarOrder.filter((id: string) => hasModulePermission(id, userRole));
  
  // Separate into favorites vs main modules lists
  const favItems = allowedSidebarOrder.filter((id: string) => sidebarFavorites.includes(id) && !sidebarHidden.includes(id));
  const mainItems = allowedSidebarOrder.filter((id: string) => !sidebarFavorites.includes(id) && !sidebarHidden.includes(id));

  return (
    <div className={`min-h-screen flex transition-colors duration-500 bg-linear-to-br ${bizType.color}`}>
      {/* Sidebar Navigation */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 border-r border-white/5 bg-black/25 backdrop-blur-xl p-4 ${bizType.border} select-none`}>
        <div className="flex items-center justify-between px-2 py-2">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold tracking-tight">NexaStock</span>
          </Link>
          <button
            onClick={() => setIsEditingSidebar(!isEditingSidebar)}
            title="Personalize Sidebar"
            className={`p-1.5 rounded-lg border transition-all ${
              isEditingSidebar 
                ? "bg-primary/20 border-primary/40 text-primary animate-pulse-glow" 
                : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditingSidebar ? (
          // SIDEBAR EDIT MODE
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-2">
              <Caption>Customize Navigation</Caption>
              <button 
                onClick={resetWorkspace} 
                title="Reset layout to template defaults" 
                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset
              </button>
            </div>
            
            <div className="mt-3 space-y-1.5 overflow-y-auto flex-1 pr-1">
              {sidebarOrder.map((modId, index) => {
                const config = MODULE_REGISTRY[modId];
                if (!config) return null;
                const locked = isLocked(modId);
                const hidden = sidebarHidden.includes(modId);
                const favorite = sidebarFavorites.includes(modId);

                return (
                  <div
                    key={modId}
                    draggable={!locked}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                      locked 
                        ? "bg-black/40 border-dashed border-white/5 text-muted-foreground opacity-40" 
                        : hidden 
                          ? "bg-white/2 border-white/5 text-muted-foreground line-through decoration-white/20"
                          : "bg-white/5 border-white/10 text-foreground"
                    }`}
                  >
                    {!locked ? (
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground/80">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground/60"><Lock className="w-3.5 h-3.5" /></div>
                    )}
                    
                    <span className="flex-1 truncate">{config.label}</span>

                    {!locked && (
                      <div className="flex items-center gap-1.5">
                        {/* Up/Down arrow accessibility fallbacks */}
                        <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveItem(index, "down")} disabled={index === sidebarOrder.length - 1} className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                        
                        {/* Toggle visibility */}
                        <button 
                          onClick={() => toggleVisibility(modId)} 
                          title={hidden ? "Show module" : "Hide module"}
                          className={`hover:text-primary ${hidden ? "text-muted-foreground/40" : "text-primary"}`}
                        >
                          {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        
                        {/* Toggle favorite */}
                        <button 
                          onClick={() => toggleFavorite(modId)} 
                          title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                          className={`hover:text-warning ${favorite ? "text-warning fill-warning/20" : "text-muted-foreground/40"}`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="pt-4 mt-auto">
              <Button onClick={() => setIsEditingSidebar(false)} variant="premiumGradient" className="w-full text-xs h-8">
                Done Personalizing
              </Button>
            </div>
          </div>
        ) : (
          // SIDEBAR NORMAL RENDER
          <div className="mt-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* ⭐ FAVORITES SECTION */}
            {favItems.length > 0 && (
              <div className="mb-5">
                <Caption className="px-2 text-warning flex items-center gap-1">⭐ Favorites</Caption>
                <nav className="mt-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {favItems.map((modId) => {
                      const item = MODULE_REGISTRY[modId];
                      if (!item) return null;
                      const active = pathname === item.to;
                      return (
                        <motion.div key={modId} layout>
                          <Link
                            to={item.to}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                              active
                                ? "bg-white/[0.05] text-foreground border border-white/10 shadow-glow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                            }`}
                          >
                            <item.icon className="w-4 h-4 text-warning" />
                            {item.label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </nav>
              </div>
            )}

            {/* 📂 GENERAL WORKSPACE SECTION */}
            <div>
              <Caption className="px-2">Workspace Modules</Caption>
              <nav className="mt-2 space-y-1">
                <AnimatePresence mode="popLayout">
                  {mainItems.map((modId) => {
                    const item = MODULE_REGISTRY[modId];
                    if (!item) return null;
                    const active = pathname === item.to;
                    return (
                      <motion.div key={modId} layout>
                        <Link
                          to={item.to}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                            active
                              ? "bg-white/[0.05] text-foreground border border-white/10 shadow-glow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </nav>
            </div>

            {/* COPILOT ADVERTISEMENT */}
            <div className="mt-auto glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-primary text-xs">
                <Sparkles className="w-3.5 h-3.5" /> NexaStock AI
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">Ask anything about your operations.</div>
              <Link to="/ai" className="block mt-3">
                <Button variant="premiumGradient" size="md" className="w-full text-xs">
                  Open AI
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-6 py-3.5">
            <div className="md:hidden"><Logo /></div>
            <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 py-2 w-full max-w-md">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                placeholder="Search products, stores, SKUs…"
              />
              <kbd className="text-[10px] text-muted-foreground border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer shadow-glow-sm border border-white/10"
              >
                {userInitials}
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfileSettingsModal onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
