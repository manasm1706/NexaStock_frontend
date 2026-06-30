import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  X, LogOut, Building2, Users, Boxes, Store, CreditCard, Shield,
  Activity, TrendingUp, Plus, Briefcase, MapPin, Mail, Phone,
  Award, DollarSign, CheckCircle2, AlertTriangle, KeyRound
} from "lucide-react";

import { api, authState } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";

interface ProfileSettingsModalProps {
  onClose: () => void;
}

export function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { format } = useCurrency();
  const localProfile = authState.getProfile();

  // 1. Fetch real-time user profile data
  const { data: profileResponse, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
    staleTime: 30000,
  });

  // 2. Fetch tenant summary (billing & stats)
  const { data: tenantSummary, isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-summary"],
    queryFn: () => api.getTenantSummary(),
    staleTime: 30000,
  });

  // 3. Conditional queries based on roles
  const userRole = localProfile?.role || "";

  // Fetch locations (for operations/store managers)
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations(),
    enabled: ["operations_manager", "store_manager", "business_owner", "super_admin"].includes(userRole),
  });

  // Fetch transfers (for operations/warehouse managers)
  const { data: transfers = [] } = useQuery({
    queryKey: ["transfers"],
    queryFn: () => api.getTransfers(),
    enabled: ["operations_manager", "warehouse_manager", "business_owner", "super_admin"].includes(userRole),
  });

  // Fetch POS Summary (for cashier/store managers)
  const { data: posSummary } = useQuery({
    queryKey: ["pos-summary"],
    queryFn: () => api.getPOSSummary(),
    enabled: ["cashier", "store_manager", "business_owner", "super_admin"].includes(userRole),
  });

  // Handle logout flow
  const handleLogout = () => {
    try {
      authState.logout();
      queryClient.clear();
      toast.success("Logged out successfully");
      onClose();
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    }
  };

  // Derive initial letters
  const fullName = profileResponse?.user?.fullName || localProfile?.fullName || "Jane Doe";
  const email = profileResponse?.user?.email || localProfile?.email || "user@company.com";
  const roleLabel = profileResponse?.roleLabel || localProfile?.roleLabel || "User";
  const userInitials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const tenant = tenantSummary?.tenant || {};
  const planName = (tenant.plan || "professional").toUpperCase();

  // Define counts and limits based on plan
  const planLimits: Record<string, { users: number; locations: number; products: number }> = {
    starter: { users: 5, locations: 2, products: 100 },
    growth: { users: 15, locations: 5, products: 1000 },
    professional: { users: 50, locations: 10, products: 10000 },
    enterprise: { users: 999, locations: 999, products: 99999 },
  };

  const currentLimits = planLimits[tenant.plan || "professional"] || planLimits.professional;
  const currentUsers = tenantSummary?.users || 1;
  const currentLocations = tenantSummary?.locations || 1;
  const currentProducts = tenantSummary?.products || 1;

  // Render role-specific control views
  const renderRoleWidget = () => {
    switch (userRole) {
      case "business_owner":
      case "super_admin":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Tenant Administration</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Organization</div>
                <div className="text-sm font-medium text-foreground mt-1 truncate">{tenant.name || "Acme Retail Group"}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Legal Entity</div>
                <div className="text-sm font-medium text-foreground mt-1 truncate">{tenant.legalName || "Acme Retail Group Private Limited"}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Operational Model</div>
                <div className="text-sm font-medium text-success mt-1">{tenant.operationalModel || "HYBRID"}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Industry Profile</div>
                <div className="text-sm font-medium text-foreground mt-1 capitalize">{tenant.industry || "multi-channel retail"}</div>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground">Enterprise Configuration Settings</div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-muted-foreground">Valuation Method</span>
                <span className="text-foreground font-mono">FIFO (First-In, First-Out)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-muted-foreground">MFA Enforcement</span>
                <span className="text-warning font-semibold">Optional</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-muted-foreground">Audit Log Level</span>
                <span className="text-primary font-semibold">Verbose</span>
              </div>
            </div>
          </div>
        );

      case "operations_manager": {
        const pendingTransfers = transfers.filter((t: any) => t.status === "pending").length;
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Operations Console</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Active Locations</div>
                <div className="text-2xl font-semibold text-foreground mt-1">{locations.length}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-xs text-muted-foreground">Pending Stock Transfers</div>
                <div className="text-2xl font-semibold text-warning mt-1">{pendingTransfers}</div>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/2 p-3">
              <div className="text-xs text-muted-foreground mb-2">Location Directory Overview</div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 divide-y divide-white/5 pr-1">
                {locations.map((loc: any) => (
                  <div key={loc.id} className="flex justify-between items-center text-xs pt-1.5">
                    <span className="text-foreground truncate max-w-[150px]">{loc.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-white/5 px-1.5 py-0.5 rounded bg-white/2">
                      {loc.type || loc.locationType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "warehouse_manager": {
        const warehouseLocs = locations.filter((l: any) => l.type === "warehouse" || l.locationType === "WAREHOUSE");
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Warehouse Console</h3>
            <div className="rounded-xl border border-white/5 bg-white/2 p-3 space-y-2">
              <div className="text-xs text-muted-foreground">Assigned Warehouses</div>
              {warehouseLocs.length > 0 ? (
                warehouseLocs.map((loc: any) => (
                  <div key={loc.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0 last:pb-0 pt-1">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{loc.name}</div>
                      <div className="text-[10px] text-muted-foreground">{loc.city}, {loc.state}</div>
                    </div>
                    <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-semibold">
                      Health: {loc.healthScore || 94}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">Assigned Central Warehouse (loc_wh_central)</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-center">
                <div className="text-muted-foreground">Total Transfers</div>
                <div className="text-lg font-semibold text-foreground mt-1">{transfers.length}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-center">
                <div className="text-muted-foreground">Pending Picklists</div>
                <div className="text-lg font-semibold text-warning mt-1">
                  {transfers.filter((t: any) => ["pending", "approved"].includes(t.status)).length}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "store_manager": {
        const storeLocs = locations.filter((l: any) => l.type === "store" || l.locationType === "STORE");
        const salesTotal = posSummary?.todaySales || "$12,450";
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Store Controller</h3>
            <div className="rounded-xl border border-white/5 bg-white/2 p-3 space-y-2">
              <div className="text-xs text-muted-foreground">Assigned Stores</div>
              {storeLocs.length > 0 ? (
                storeLocs.map((loc: any) => (
                  <div key={loc.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0 last:pb-0 pt-1">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{loc.name}</div>
                      <div className="text-[10px] text-muted-foreground">{loc.code} · {loc.city}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Staff Count: {loc.staffCount || 7}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">Assigned Indiranagar Store (loc_store_01)</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-muted-foreground">Today's Store Sales</div>
                <div className="text-base font-semibold text-foreground mt-1">{salesTotal}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <div className="text-muted-foreground">Invoices Processed</div>
                <div className="text-base font-semibold text-foreground mt-1">{posSummary?.invoiceCount || 34}</div>
              </div>
            </div>
          </div>
        );
      }

      case "cashier":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">POS Station Dashboard</h3>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Assigned Register</span>
                <span className="text-foreground font-semibold">ST-101 / Terminal 1</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Current Shift Status</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" /> Active Shift
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Logged-in Cashier ID</span>
                <span className="text-foreground font-mono">{localProfile?.id?.substring(0, 8) || "user_cashier"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-center">
                <div className="text-muted-foreground">Transactions (Today)</div>
                <div className="text-xl font-semibold text-foreground mt-1">{posSummary?.invoiceCount || 18}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-center">
                <div className="text-muted-foreground">Register Balance</div>
                <div className="text-xl font-semibold text-foreground mt-1">{format(1450)}</div>
              </div>
            </div>
          </div>
        );

      case "supplier":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Supplier Portal Profile</h3>
            <div className="rounded-xl border border-white/5 bg-white/2 p-3 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Supplier Code</span>
                <span className="text-foreground font-mono font-semibold">SUP-PH-01</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Supplier Rating</span>
                <span className="text-success font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-success" /> 96% Excellent
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Preferred Categories</span>
                <span className="text-foreground truncate max-w-[150px]">Pharmacy, FMCG</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/2 p-3">
              <div className="text-xs text-muted-foreground mb-2">Active Purchase Orders</div>
              <div className="text-xs text-muted-foreground italic text-center py-2">
                No outstanding orders. All shipments received.
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-white/15 rounded-2xl">
            Select a section or check your notifications.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur background overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/40 backdrop-blur-md cursor-default"
      />

      {/* Modal Window content container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.45 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl glass rounded-3xl p-6 md:p-8 shadow-premium border border-white/10 z-10 flex flex-col md:flex-row gap-8 max-h-[85vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Left column - User details and subscription */}
        <div className="w-full md:w-[320px] shrink-0 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* User Profile Summary */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-premium shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-lg text-foreground truncate">{fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{email}</div>
                <span className="inline-block mt-2 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Plan and billing statistics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan & billing</span>
                <span className="text-[10px] font-bold bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-primary" /> Subscription
                  </span>
                  <span className="text-foreground font-semibold font-display">{planName}</span>
                </div>

                {/* Progress limits */}
                <div className="space-y-2.5 pt-1">
                  {/* Users */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Users / Seats</span>
                      <span className="text-foreground font-medium">{currentUsers} / {currentLimits.users}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentUsers / currentLimits.users) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Locations / Stores</span>
                      <span className="text-foreground font-medium">{currentLocations} / {currentLimits.locations}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentLocations / currentLimits.locations) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">SKUs Cataloged</span>
                      <span className="text-foreground font-medium">{currentProducts} / {currentLimits.products}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentProducts / currentLimits.products) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Trigger */}
          <div className="pt-4 border-t border-white/5">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-11 border-destructive/25 text-destructive hover:bg-destructive/10 bg-transparent flex items-center justify-center gap-2 group transition-colors rounded-xl"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> Sign out of NexaStock
            </Button>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-white/5 self-stretch" />

        {/* Right column - Role adapted view info */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Workspace Workspace Config</h2>
            <p className="text-xs text-muted-foreground mt-1">Manage details based on your role context.</p>
          </div>

          <div className="space-y-6">
            {renderRoleWidget()}

            {/* General Settings / Security Panel */}
            <div className="h-px bg-white/5" />

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Device & Session Info</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">Active session secured</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4 text-success shrink-0" />
                  <span className="truncate">Node API latency: ~14ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
