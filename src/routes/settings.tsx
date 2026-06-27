import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import {
  Building2, Users, Shield, Bell, KeyRound, CreditCard, Loader2,
  Lock, Key, Laptop, Info, Plus, Check, Trash2, UserX, UserCheck, RefreshCw, XCircle, LayoutGrid, GripVertical, Star, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw,
  MapPin, ShieldAlert, Copy
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { MODULE_REGISTRY, hasModulePermission } from "@/components/app/DashboardLayout";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexaStock" }] }),
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

    if (!hasModulePermission("settings", role, permissions)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsPage,
});

type SettingsTab = "organization" | "team" | "workspace" | "security" | "notifications" | "audit";

function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");
  const localProfile = authState.getProfile();

  // ==========================================
  // API Queries
  // ==========================================

  // 1. Tenant Summary / Organization Info
  const { data: tenantSummary, isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-summary"],
    queryFn: () => api.getTenantSummary()
  });

  // 2. Users / Team Members
  const { data: teamData = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["team-users"],
    queryFn: () => api.getUsers()
  });

  // 3. Roles list
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.getRoles(),
    enabled: activeTab === "team"
  });

  // Locations list
  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations(),
    enabled: activeTab === "team"
  });

  // 4. Audit Trail logs
  const { data: auditLogs = [], isLoading: loadingAudits } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => api.getAuditEvents(),
    enabled: activeTab === "audit"
  });

  // 5. Active user sessions
  const { data: activeSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.getActiveSessions(),
    enabled: activeTab === "security"
  });

  // 6. Password Policy
  const { data: passwordPolicy, isLoading: loadingPolicy } = useQuery({
    queryKey: ["password-policy"],
    queryFn: () => api.getPasswordPolicy(),
    enabled: activeTab === "security"
  });

  // 7. Notification preferences
  const { data: notifPref, isLoading: loadingNotifs } = useQuery({
    queryKey: ["notifications-pref"],
    queryFn: () => api.getNotificationPreferences(),
    enabled: activeTab === "notifications"
  });

  const isLoading = loadingTenant || (activeTab === "team" && (loadingTeam || loadingRoles || loadingLocations));

  // ==========================================
  // Form States
  // ==========================================

  // Organization settings form
  const [orgName, setOrgName] = useState("");
  const [orgLegalName, setOrgLegalName] = useState("");
  const [orgTimezone, setOrgTimezone] = useState("");
  const [orgCurrency, setOrgCurrency] = useState("");
  const [updatingOrg, setUpdatingOrg] = useState(false);

  // Invite user form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviting, setInviting] = useState(false);

  // Custom role creator
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

  // Modal states for Branch Transfer & Permission Overrides
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  // States for Branch Modal Form
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [savingLocations, setSavingLocations] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  // States for Override Modal Form
  const [selectedOverrides, setSelectedOverrides] = useState<Record<string, "INHERIT" | "ALLOW" | "DENY">>({});
  const [savingOverrides, setSavingOverrides] = useState(false);

  // Cloned role dialog
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneRoleName, setCloneRoleName] = useState("");
  const [cloneRoleDesc, setCloneRoleDesc] = useState("");
  const [cloningRole, setCloningRole] = useState(false);

  // Master system permissions definition
  const masterPermissionList = useMemo(() => {
    return [
      { code: "PRODUCT_MANAGEMENT", name: "Product Catalog Management" },
      { code: "INVENTORY_READ", name: "Read Inventory Levels" },
      { code: "INVENTORY_WRITE", name: "Modify Inventory & Adjustments" },
      { code: "POS_SALES", name: "Process Point of Sale Checkout" },
      { code: "ANALYTICS_READ", name: "Read Store Analytics & Metrics" },
      { code: "AI_READ", name: "Read AI Center Recommendations" },
      { code: "SETTINGS_MANAGE", name: "Manage System Settings & Policies" },
      { code: "USER_MANAGEMENT", name: "Manage Team Members & Invites" },
      { code: "TENANT_ADMIN", name: "Full Organization Control" },
      { code: "AUDIT_READ", name: "Read Security Compliance Logs" }
    ];
  }, []);

  // Permission Matrix Selected Role
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const { data: selectedRolePerms = [], refetch: refetchPerms, isLoading: loadingPerms } = useQuery({
    queryKey: ["role-permissions", selectedRoleId],
    queryFn: () => api.getRolePermissions(selectedRoleId),
    enabled: !!selectedRoleId
  });

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Initialize Organization editing inputs when summary loads
  useMemo(() => {
    if (tenantSummary?.tenant) {
      setOrgName(tenantSummary.tenant.name || "");
      setOrgLegalName(tenantSummary.tenant.legalName || "");
      setOrgTimezone(tenantSummary.tenant.timezone || "Asia/Kolkata");
      setOrgCurrency(tenantSummary.tenant.primaryCurrency || "USD");
    }
  }, [tenantSummary]);

  // ==========================================
  // Action Handlers
  // ==========================================

  // Update Org Info
  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setUpdatingOrg(true);
    try {
      await api.updateTenantSummary({
        name: orgName,
        legalName: orgLegalName,
        timezone: orgTimezone,
        primaryCurrency: orgCurrency
      });
      queryClient.invalidateQueries({ queryKey: ["tenant-summary"] });
      toast.success("Organization details updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization");
    } finally {
      setUpdatingOrg(false);
    }
  };

  // Invite Team Member
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim() || !inviteRoleId) {
      toast.error("Please fill out all fields.");
      return;
    }
    setInviting(true);
    try {
      const result = await api.inviteUser(inviteEmail, inviteName, inviteRoleId);
      setInviteEmail("");
      setInviteName("");
      setInviteRoleId("");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      
      // Since it's a demo backend that mocks emails, show the accept link in a toast or summary for manual acceptance
      const acceptLink = result.inviteLink;
      toast.success(
        <div>
          <span className="font-semibold">User Invited Successfully!</span>
          <p className="text-[10px] text-muted-foreground mt-1 select-all font-mono bg-black/30 p-1 rounded border border-white/5">
            Link: {window.location.origin + acceptLink}
          </p>
        </div>,
        { duration: 15000 }
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  // Resend Invite
  const handleResendInvite = async (userId: string) => {
    try {
      const result = await api.resendInvitation(userId);
      toast.success(
        <div>
          <span className="font-semibold">Invitation resent!</span>
          <p className="text-[10px] text-muted-foreground mt-1 select-all font-mono bg-black/30 p-1 rounded border border-white/5">
            New Link: {window.location.origin + result.inviteLink}
          </p>
        </div>,
        { duration: 15000 }
      );
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invite");
    }
  };

  // Cancel Invite
  const handleCancelInvite = async (userId: string) => {
    try {
      await api.cancelInvitation(userId);
      toast.success("Invitation cancelled/revoked.");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel invite");
    }
  };

  // User Actions (Edit role, Deactivate, Reactivate, Delete)
  const handleDeactivateUser = async (userId: string) => {
    try {
      await api.deactivateUser(userId);
      toast.success("User account deactivated.");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Deactivation failed");
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      await api.reactivateUser(userId);
      toast.success("User account reactivated.");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Reactivation failed");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently remove this user? This cannot be undone.")) return;
    try {
      await api.removeUser(userId);
      toast.success("User permanently deleted.");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Deletion failed");
    }
  };

  const handleUserRoleChange = async (userId: string, newRoleId: string) => {
    try {
      await api.updateUserRole(userId, newRoleId);
      toast.success("User role updated.");
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
    } catch (err: any) {
      toast.error(err.message || "Role update failed");
    }
  };

  // Custom Role Creation
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      await api.createCustomRole(newRoleName, newRoleDesc);
      setNewRoleName("");
      setNewRoleDesc("");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Custom role created successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to create custom role");
    } finally {
      setCreatingRole(false);
    }
  };

  // Branch Transfer, Permission Overrides, and Role Cloning handlers
  const openBranchModal = (user: any) => {
    setSelectedUser(user);
    setSelectedLocationIds((user.assignedLocations || []).map((al: any) => al.locationId));
    setBranchSearch("");
    setIsBranchModalOpen(true);
  };

  const handleSaveLocations = async () => {
    if (!selectedUser) return;
    setSavingLocations(true);
    try {
      await api.updateUserLocations(selectedUser.id, selectedLocationIds);
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("User branch assignments updated successfully.");
      setIsBranchModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update branch assignments");
    } finally {
      setSavingLocations(false);
    }
  };

  const openOverrideModal = (user: any) => {
    setSelectedUser(user);
    const initialOverrides: Record<string, "INHERIT" | "ALLOW" | "DENY"> = {};
    
    // Set default as INHERIT
    masterPermissionList.forEach((p) => {
      initialOverrides[p.code] = "INHERIT";
    });

    // Populate current overrides
    (user.permissionOverrides || []).forEach((ov: any) => {
      if (ov.permissionCode) {
        initialOverrides[ov.permissionCode] = ov.allowed ? "ALLOW" : "DENY";
      }
    });

    setSelectedOverrides(initialOverrides);
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverrides = async () => {
    if (!selectedUser) return;
    setSavingOverrides(true);
    try {
      const userRoleId = roles.find((r: any) => r.code === selectedUser.role)?.id;
      if (!userRoleId) {
        throw new Error("Unable to resolve user's role ID");
      }
      
      const allPerms = await api.getRolePermissions(userRoleId);
      const overridesToSave: Array<{ permissionId: string; allowed: boolean }> = [];
      
      for (const [code, val] of Object.entries(selectedOverrides)) {
        if (val !== "INHERIT") {
          const perm = allPerms.find((p: any) => p.code === code);
          if (perm) {
            overridesToSave.push({
              permissionId: perm.permissionId,
              allowed: val === "ALLOW"
            });
          }
        }
      }

      await api.updateUserPermissions(selectedUser.id, overridesToSave);
      queryClient.invalidateQueries({ queryKey: ["team-users"] });
      toast.success("User permission overrides updated successfully.");
      setIsOverrideModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update permission overrides");
    } finally {
      setSavingOverrides(false);
    }
  };

  const handleCloneRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    if (!cloneRoleName.trim()) {
      toast.error("Role name is required.");
      return;
    }
    setCloningRole(true);
    try {
      await api.cloneRole(selectedRoleId, cloneRoleName, cloneRoleDesc || "");
      setCloneRoleName("");
      setCloneRoleDesc("");
      setIsCloneModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role cloned successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to clone role");
    } finally {
      setCloningRole(false);
    }
  };


  // Toggle Permission Matrix Cell
  const handlePermissionToggle = async (permCode: string, currentlyAllowed: boolean) => {
    if (!selectedRoleId) return;
    try {
      await api.saveRolePermissions(selectedRoleId, [
        { code: permCode, allowed: !currentlyAllowed }
      ]);
      queryClient.invalidateQueries({ queryKey: ["role-permissions", selectedRoleId] });
      toast.success("Permissions updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle permission");
    }
  };

  // Change Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Revoke other active sessions
  const handleRevokeOtherSessions = async () => {
    try {
      await api.revokeOtherSessions();
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Other active sessions revoked.");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke sessions");
    }
  };

  // Save security complexity policy
  const handleUpdatePolicy = async (policyInput: any) => {
    try {
      await api.updatePasswordPolicy(policyInput);
      queryClient.invalidateQueries({ queryKey: ["password-policy"] });
      toast.success("Password security policy updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save policy");
    }
  };

  // Toggle Notification preferences checkbox
  const handleTogglePreference = async (prefKey: string, currentValue: boolean) => {
    try {
      const payload: Record<string, boolean> = {
        emailEnabled: notifPref?.emailEnabled ?? true,
        inAppEnabled: notifPref?.inAppEnabled ?? true,
        lowStockAlerts: notifPref?.metadata?.lowStockAlerts ?? true,
        inventoryAlerts: notifPref?.metadata?.inventoryAlerts ?? true,
        teamActivity: notifPref?.metadata?.teamActivity ?? true,
        invitationNotifications: notifPref?.metadata?.invitationNotifications ?? true
      };
      payload[prefKey] = !currentValue;
      await api.updateNotificationPreferences(payload);
      queryClient.invalidateQueries({ queryKey: ["notifications-pref"] });
      toast.success("Preferences saved.");
    } catch (err: any) {
      toast.error("Failed to save notification preferences");
    }
  };

  // Check route-level locks based on active roles
  const currentUserRole = localProfile?.role || "";
  const isOwner = currentUserRole === "business_owner" || currentUserRole === "super_admin";

  const settingsTabs = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "team", label: "Team & Roles", icon: Users },
    { id: "workspace", label: "Workspace Settings", icon: LayoutGrid },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "audit", label: "Audit logs", icon: KeyRound },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading system properties...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const tenant = tenantSummary?.tenant || {};

  return (
    <DashboardLayout title="Settings" subtitle="Configure your NexaStock workspace and security preferences">
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Left Side Navigation Tabs */}
        <nav className="space-y-1">
          {settingsTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? "bg-primary/10 border border-primary/20 text-primary" 
                    : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-white/3"
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" /> {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Panels */}
        <div className="space-y-6">
          
          {/* TAB 1: ORGANIZATION DETAILS */}
          {activeTab === "organization" && (
            <GlassCard className="p-6">
              <SectionTitle>Organization details</SectionTitle>
              <div className="text-xs text-muted-foreground">Branding, localization, and currency details for your workspace</div>
              
              <form onSubmit={handleUpdateOrganization} className="mt-5 space-y-4 max-w-xl">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold">Display Name</label>
                    <input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      disabled={!isOwner}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold">Legal Entity Name</label>
                    <input
                      value={orgLegalName}
                      onChange={(e) => setOrgLegalName(e.target.value)}
                      disabled={!isOwner}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold">Workspace Currency</label>
                    <select
                      value={orgCurrency}
                      onChange={(e) => setOrgCurrency(e.target.value)}
                      disabled={!isOwner}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold">Timezone</label>
                    <select
                      value={orgTimezone}
                      onChange={(e) => setOrgTimezone(e.target.value)}
                      disabled={!isOwner}
                      className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC (Greenwich Mean Time)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (BST)</option>
                    </select>
                  </div>
                </div>

                {isOwner && (
                  <Button type="submit" disabled={updatingOrg} variant="premiumGradient" className="h-9 px-4 mt-2 text-xs">
                    {updatingOrg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                  </Button>
                )}
              </form>
            </GlassCard>
          )}

          {/* TAB 2: TEAM MANAGEMENT & ROLES */}
          {activeTab === "team" && (
            <div className="space-y-6">
              
              {/* Invite user form */}
              {isOwner && (
                <GlassCard className="p-6">
                  <SectionTitle>Invite new team member</SectionTitle>
                  <p className="text-xs text-muted-foreground">Add new staff members to collaborate in this workspace</p>
                  
                  <form onSubmit={handleInviteUser} className="mt-4 grid sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-muted-foreground font-semibold">Full Name</label>
                      <input
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-muted-foreground font-semibold">Email Address</label>
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="you@company.com"
                        type="email"
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] text-muted-foreground font-semibold">Assigned Role</label>
                      <select
                        value={inviteRoleId}
                        onChange={(e) => setInviteRoleId(e.target.value)}
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Select a role...</option>
                        {roles.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" disabled={inviting} variant="premiumGradient" className="h-9 w-full text-xs flex items-center justify-center gap-1">
                      {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Invite</>}
                    </Button>
                  </form>
                </GlassCard>
              )}

              {/* Users list */}
              <GlassCard className="p-6">
                <SectionTitle>Active & Pending Users</SectionTitle>
                <div className="text-xs text-muted-foreground mt-1">Manage seats, roles, deactivations, and deletion settings</div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                        <th className="py-2">Team Member</th>
                        <th className="py-2">Role</th>
                        <th className="py-2">Assigned Branches</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Last Login</th>
                        {isOwner && <th className="py-2 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {teamData.map((m: any) => (
                        <tr key={m.id} className="hover:bg-white/1">
                          <td className="py-2.5">
                            <div className="font-semibold text-foreground">{m.fullName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{m.email}</div>
                          </td>
                          <td className="py-2.5">
                            {isOwner && m.id !== localProfile?.id && m.status !== "invited" ? (
                              <select
                                value={roles.find((r: any) => r.code === m.role)?.id || ""}
                                onChange={(e) => handleUserRoleChange(m.id, e.target.value)}
                                className="h-8 rounded-lg border border-white/10 bg-black/20 text-xs px-2 outline-none"
                              >
                                {roles.map((r: any) => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-medium text-foreground">{m.roleLabel || m.role}</span>
                            )}
                          </td>
                          <td className="py-2.5">
                            {["business_owner", "super_admin", "operations_manager"].includes(m.role) ? (
                              <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md font-semibold uppercase">
                                All Branches (Global)
                              </span>
                            ) : !m.assignedLocations || m.assignedLocations.length === 0 ? (
                              <span className="text-[10px] text-destructive bg-destructive/5 border border-destructive/15 px-1.5 py-0.5 rounded-md font-semibold uppercase">
                                Restricted (None)
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {m.assignedLocations.map((al: any) => {
                                  const locName = locations.find((l: any) => l.id === al.locationId)?.name || "Store";
                                  return (
                                    <span key={al.locationId} className="text-[10px] text-primary bg-primary/5 border border-primary/15 px-1.5 py-0.5 rounded-md font-semibold">
                                      {locName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${
                              m.status === "active" ? "text-success bg-success/5 border-success/20" :
                              m.status === "invited" ? "text-warning bg-warning/5 border-warning/20" : "text-muted-foreground border-white/10"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-[10px] text-muted-foreground">
                            {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString() : "Never"}
                          </td>
                          {isOwner && (
                            <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                              {m.id !== localProfile?.id && (
                                <>
                                  {m.status === "invited" && (
                                    <>
                                      <button onClick={() => handleResendInvite(m.id)} title="Resend Invite" className="p-1 rounded hover:bg-white/10 text-warning inline-flex"><RefreshCw className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => handleCancelInvite(m.id)} title="Cancel Invite" className="p-1 rounded hover:bg-white/10 text-destructive inline-flex"><XCircle className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                                  {m.status === "active" && (
                                    <>
                                      <button onClick={() => openBranchModal(m)} title="Transfer Branch" className="p-1 rounded hover:bg-white/10 text-primary inline-flex"><MapPin className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => openOverrideModal(m)} title="Override Permissions" className="p-1 rounded hover:bg-white/10 text-success inline-flex"><ShieldAlert className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => handleDeactivateUser(m.id)} title="Deactivate" className="p-1 rounded hover:bg-white/10 text-warning inline-flex"><UserX className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                                  {m.status === "disabled" && (
                                    <>
                                      <button onClick={() => openBranchModal(m)} title="Transfer Branch" className="p-1 rounded hover:bg-white/10 text-primary inline-flex"><MapPin className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => openOverrideModal(m)} title="Override Permissions" className="p-1 rounded hover:bg-white/10 text-success inline-flex"><ShieldAlert className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => handleReactivateUser(m.id)} title="Reactivate" className="p-1 rounded hover:bg-white/10 text-success inline-flex"><UserCheck className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                                  <button onClick={() => handleRemoveUser(m.id)} title="Remove Permanently" className="p-1 rounded hover:bg-white/10 text-destructive inline-flex"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Roles list & creator */}
              {isOwner && (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Create custom role */}
                  <GlassCard className="p-5 space-y-4">
                    <SectionTitle>Create custom role</SectionTitle>
                    <form onSubmit={handleCreateRole} className="space-y-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground font-semibold">Role Name</label>
                        <input
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="e.g. Procurement Lead"
                          className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-semibold">Description</label>
                        <textarea
                          value={newRoleDesc}
                          onChange={(e) => setNewRoleDesc(e.target.value)}
                          placeholder="What this role handles..."
                          rows={2}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/2 p-2 text-xs text-foreground outline-none focus:border-primary font-sans resize-none"
                        />
                      </div>
                      <Button type="submit" disabled={creatingRole} variant="premiumGradient" className="h-9 w-full text-xs">
                        {creatingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Role"}
                      </Button>
                    </form>
                  </GlassCard>

                  {/* Permission Matrix */}
                  <GlassCard className="lg:col-span-2 p-5 space-y-4">
                    <SectionTitle>Permission Matrix Editor</SectionTitle>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Select Role:</span>
                        <select
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                          className="h-8 rounded-lg border border-white/10 bg-black/20 text-xs px-2 outline-none"
                        >
                          <option value="">Select a role to configure...</option>
                          {roles.map((r: any) => (
                            <option key={r.id} value={r.id}>{r.name} {r.isSystem ? "(System)" : ""}</option>
                          ))}
                        </select>
                      </div>

                      {selectedRoleId && (
                        <Button 
                          onClick={() => {
                            const r = roles.find((role: any) => role.id === selectedRoleId);
                            setCloneRoleName(r ? `Copy of ${r.name}` : "");
                            setCloneRoleDesc(r ? r.description || "" : "");
                            setIsCloneModalOpen(true);
                          }}
                          variant="outline" 
                          className="h-8 text-xs flex items-center gap-1 border-white/10 bg-white/3 hover:bg-white/10 text-foreground cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" /> Clone Role
                        </Button>
                      )}
                    </div>

                    {selectedRoleId ? (
                      loadingPerms ? (
                        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground font-mono">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading permissions...
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto border border-white/5 rounded-xl divide-y divide-white/5 bg-black/20 pr-1">
                          {selectedRolePerms.map((p: any) => (
                            <div key={p.permissionId} className="flex items-center justify-between p-2.5 text-xs text-foreground">
                              <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono uppercase">Key: {p.code} · Module: {p.module}</div>
                              </div>
                              <button
                                onClick={() => handlePermissionToggle(p.code, p.allowed)}
                                className={`h-6 px-2.5 rounded-full text-[10px] font-semibold border transition-all ${
                                  p.allowed
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-destructive/5 text-destructive border-destructive/20 hover:bg-success/5"
                                }`}
                              >
                                {p.allowed ? "Allowed" : "Blocked"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-white/15 rounded-xl">
                        Select a role above to view and edit its active permissions matrix.
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY CENTER */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              {/* Profile updates & Change Password */}
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Profile update form */}
                <GlassCard className="p-6">
                  <SectionTitle>Update Profile Details</SectionTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your personal display name and email address</p>
                  
                  {/* Inline profile update */}
                  <ProfileUpdateForm initialName={localProfile?.fullName || ""} initialEmail={localProfile?.email || ""} />
                </GlassCard>

                {/* Change password form */}
                <GlassCard className="p-6">
                  <SectionTitle>Change password</SectionTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 font-sans">Choose a secure, custom password to lock credentials</p>

                  <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground font-semibold">Current Password</label>
                      <input
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-semibold">New Password</label>
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-semibold">Confirm New Password</label>
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <Button type="submit" disabled={updatingPassword} variant="premiumGradient" className="h-9 w-full text-xs">
                      {updatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Password"}
                    </Button>
                  </form>
                </GlassCard>
              </div>

              {/* Password complexity Policy settings */}
              {isOwner && (
                <GlassCard className="p-6">
                  <SectionTitle>Password complexity rules policies</SectionTitle>
                  <p className="text-xs text-muted-foreground">Enforce strict formatting checks on staff passwords upon joining</p>
                  
                  {loadingPolicy ? (
                    <div className="py-6 text-center text-xs text-muted-foreground font-mono"><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Loading policy rules...</div>
                  ) : (
                    <div className="mt-4 grid sm:grid-cols-4 gap-4">
                      {[
                        { k: "minLength", l: "Minimum length limit", v: passwordPolicy?.minLength ?? 8, isInput: true },
                        { k: "requireNumbers", l: "Require number digits", v: passwordPolicy?.requireNumbers ?? true },
                        { k: "requireSpecialChars", l: "Require symbols/special chars", v: passwordPolicy?.requireSpecialChars ?? true },
                        { k: "requireUppercase", l: "Require upper-case letters", v: passwordPolicy?.requireUppercase ?? true }
                      ].map((p) => (
                        <div key={p.k} className="border border-white/5 p-3 rounded-2xl bg-black/20 flex flex-col justify-between h-20 text-xs">
                          <span className="text-muted-foreground">{p.l}</span>
                          {p.isInput ? (
                            <input
                              type="number"
                              min={6}
                              max={32}
                              value={p.v}
                              onChange={(e) => handleUpdatePolicy({ ...passwordPolicy, minLength: Number(e.target.value) })}
                              className="w-16 h-7 rounded border border-white/10 bg-white/5 text-center text-xs text-foreground"
                            />
                          ) : (
                            <button
                              onClick={() => {
                                const payload = { ...passwordPolicy };
                                payload[p.k] = !p.v;
                                handleUpdatePolicy(payload);
                              }}
                              className={`h-6 px-2 rounded font-semibold text-[10px] self-start border transition-all ${
                                p.v ? "text-success border-success/20 bg-success/5" : "text-muted-foreground border-white/10 bg-transparent"
                              }`}
                            >
                              {p.v ? "Enabled" : "Disabled"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Active Sessions list */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <SectionTitle>Active device session logs</SectionTitle>
                    <p className="text-xs text-muted-foreground">Log out from other devices to secure credentials</p>
                  </div>
                  <Button onClick={handleRevokeOtherSessions} variant="outline" className="border-destructive/25 text-destructive hover:bg-destructive/10 text-xs h-8">
                    Logout Other Sessions
                  </Button>
                </div>

                <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                  {loadingSessions ? (
                    <div className="text-center py-6 text-xs text-muted-foreground font-mono"><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Loading sessions...</div>
                  ) : activeSessions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground font-mono">No other sessions open</div>
                  ) : (
                    activeSessions.map((sess: any) => (
                      <div key={sess.id} className="flex justify-between items-center text-xs bg-black/20 border border-white/5 p-3 rounded-2xl font-mono text-muted-foreground">
                        <div className="flex gap-2 items-center text-foreground font-sans">
                          <Laptop className="w-4 h-4 text-primary" />
                          <div>
                            <div className="font-semibold">{sess.deviceName || "Desktop Browser"}</div>
                            <div className="text-[10px] text-muted-foreground">{sess.ipAddress} · {new Date(sess.lastSeenAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <span className="text-[9px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded font-semibold font-sans">
                          CURRENT
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS CHECKBOXES */}
          {activeTab === "notifications" && (
            <GlassCard className="p-6">
              <SectionTitle>User alert notification settings</SectionTitle>
              <div className="text-xs text-muted-foreground mt-0.5">Toggle what system updates trigger dashboard notifications</div>

              {loadingNotifs ? (
                <div className="text-center py-12 text-xs text-muted-foreground font-mono"><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Loading preferences...</div>
              ) : (
                <div className="mt-6 space-y-4 max-w-lg">
                  {[
                    { k: "lowStockAlerts", t: "Low Stock Alerts", d: "Notify when catalog items fall below safety threshold limits" },
                    { k: "inventoryAlerts", t: "Inventory Audits", d: "Notify when bulk imports or movement adjustments happen" },
                    { k: "teamActivity", t: "Staff Activity Logs", d: "Notify on roles changes or deactivation events" },
                    { k: "invitationNotifications", t: "Invitation Sign-ups", d: "Notify when invited user links are accepted" },
                  ].map((it) => {
                    const checked = notifPref?.metadata?.[it.k] ?? true;
                    return (
                      <div key={it.k} className="flex justify-between items-start gap-4 p-3 rounded-2xl bg-black/20 border border-white/5">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-foreground">{it.t}</div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{it.d}</p>
                        </div>
                        <button
                          onClick={() => handleTogglePreference(it.k, checked)}
                          className={`h-6 px-3 rounded-full border text-[10px] font-semibold transition-all ${
                            checked ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground border-white/10 bg-transparent"
                          }`}
                        >
                          {checked ? "Subscribed" : "Muted"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {/* TAB: WORKSPACE PERSONALIZATION */}
          {activeTab === "workspace" && (
            <WorkspaceSettingsPanel />
          )}

          {/* TAB 5: AUDIT LOGS COMPLIANCE */}
          {activeTab === "audit" && (
            <GlassCard className="p-6">
              <SectionTitle>Workspace Audit Log Trails</SectionTitle>
              <div className="text-xs text-muted-foreground">Historical records of logins, product catalogs changes, settings, and staff movements</div>

              <div className="mt-4 overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground font-semibold">
                      <th className="py-2.5">Timestamp</th>
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Module</th>
                      <th className="py-2.5">Action</th>
                      <th className="py-2.5">Summary Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px] font-mono text-muted-foreground">
                    {loadingAudits ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-xs text-muted-foreground font-mono">
                          <Loader2 className="w-4 h-4 animate-spin text-primary mr-1" /> Loading trails...
                        </td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-xs text-muted-foreground font-mono">No audit logs logged in ledger history</td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-white/1">
                          <td className="py-2.5 whitespace-nowrap text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-2.5 text-foreground font-sans font-medium">{log.actorName || "System"}</td>
                          <td className="py-2.5 uppercase text-[9px] font-semibold text-primary">{log.module}</td>
                          <td className="py-2.5 text-foreground">{log.action}</td>
                          <td className="py-2.5 font-sans text-muted-foreground text-[10px] leading-relaxed pr-2 max-w-xs">{log.summary}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

        </div>
      </div>

      {/* Branch Assignment Modal */}
      {isBranchModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <GlassCard className="max-w-md w-full p-6 space-y-4 border-white/10 shadow-premium relative">
            <h3 className="text-sm font-semibold text-foreground">Transfer Branch Assignment</h3>
            <p className="text-xs text-muted-foreground">
              Update assigned branches for <span className="font-semibold text-foreground">{selectedUser.fullName}</span>.
              Pune is the default backend scope.
            </p>

            {/* Local Search Filter */}
            <input
              type="text"
              value={branchSearch}
              onChange={(e) => setBranchSearch(e.target.value)}
              placeholder="Search branches by name, code or city..."
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 transition"
            />

            {/* Bulk Selection Triggers */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedLocationIds(locations.map((l: any) => l.id))}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1 text-foreground transition-all"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocationIds(locations.filter((l: any) => l.type === "store").map((l: any) => l.id))}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1 text-foreground transition-all"
              >
                All Stores
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocationIds(locations.filter((l: any) => l.type === "warehouse").map((l: any) => l.id))}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1 text-foreground transition-all"
              >
                All Warehouses
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocationIds([])}
                className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-1 text-muted-foreground hover:text-foreground transition-all"
              >
                Deselect All
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto border border-white/5 rounded-xl p-2 bg-black/20">
              {(() => {
                const filteredLocations = locations.filter((loc: any) =>
                  loc.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
                  loc.code.toLowerCase().includes(branchSearch.toLowerCase()) ||
                  loc.city.toLowerCase().includes(branchSearch.toLowerCase())
                );

                if (filteredLocations.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No branches match your search.
                    </div>
                  );
                }

                return filteredLocations.map((loc: any) => {
                  const isChecked = selectedLocationIds.includes(loc.id);
                  return (
                    <label key={loc.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/3 text-xs text-foreground cursor-pointer justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedLocationIds(selectedLocationIds.filter(id => id !== loc.id));
                            } else {
                              setSelectedLocationIds([...selectedLocationIds, loc.id]);
                            }
                          }}
                          className="rounded border-white/10 bg-white/2 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <div>
                          <div className="font-medium">{loc.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono uppercase">{loc.code} · {loc.city}</div>
                        </div>
                      </div>
                      <div>
                        {loc.type === "warehouse" ? (
                          <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-medium">
                            🏭 Warehouse
                          </span>
                        ) : (
                          <span className="text-[9px] text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded font-medium">
                            🏬 Store
                          </span>
                        )}
                      </div>
                    </label>
                  );
                });
              })()}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsBranchModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button variant="premiumGradient" size="sm" onClick={handleSaveLocations} disabled={savingLocations} className="text-xs h-8">
                {savingLocations ? <Loader2 className="w-3 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Permission Overrides Modal */}
      {isOverrideModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <GlassCard className="max-w-lg w-full p-6 space-y-4 border-white/10 shadow-premium relative">
            <h3 className="text-sm font-semibold text-foreground">Granular Permission Overrides</h3>
            <p className="text-xs text-muted-foreground font-sans">
              Configure custom overrides for <span className="font-semibold text-foreground">{selectedUser.fullName}</span>. 
              Allows you to explicitly grant or deny actions regardless of their role.
            </p>

            <div className="space-y-1 max-h-64 overflow-y-auto border border-white/5 rounded-xl p-2 bg-black/20 divide-y divide-white/5 pr-1">
              {masterPermissionList.map((perm) => {
                const currentVal = selectedOverrides[perm.code] || "INHERIT";
                return (
                  <div key={perm.code} className="flex items-center justify-between p-2.5 text-xs text-foreground">
                    <div>
                      <div className="font-semibold">{perm.name}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">{perm.code}</div>
                    </div>
                    <div className="flex gap-1.5">
                      {["INHERIT", "ALLOW", "DENY"].map((status) => {
                        const active = currentVal === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setSelectedOverrides({ ...selectedOverrides, [perm.code]: status as any })}
                            className={`px-2 py-1 rounded text-[9px] font-semibold border transition-all ${
                              active 
                                ? status === "ALLOW" ? "bg-success/15 text-success border-success/25 font-bold"
                                  : status === "DENY" ? "bg-destructive/15 text-destructive border-destructive/25 font-bold"
                                  : "bg-primary/10 text-primary border-primary/20 font-bold"
                                : "bg-white/2 text-muted-foreground border-transparent hover:bg-white/5"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsOverrideModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button variant="premiumGradient" size="sm" onClick={handleSaveOverrides} disabled={savingOverrides} className="text-xs h-8">
                {savingOverrides ? <Loader2 className="w-3 animate-spin" /> : "Save Overrides"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Role Clone Modal */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <GlassCard className="max-w-md w-full p-6 space-y-4 border-white/10 shadow-premium relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-semibold text-foreground">Duplicate / Clone Custom Role</h3>
            <p className="text-xs text-muted-foreground">
              Create a new role with the exact same permission matrix template as the selected role.
            </p>

            <form onSubmit={handleCloneRole} className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">New Role Name</label>
                <input
                  value={cloneRoleName}
                  onChange={(e) => setCloneRoleName(e.target.value)}
                  placeholder="e.g. Senior Procurement Lead"
                  className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">New Description</label>
                <textarea
                  value={cloneRoleDesc}
                  onChange={(e) => setCloneRoleDesc(e.target.value)}
                  placeholder="Describe the scope of this cloned role..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/2 p-2 text-xs text-foreground outline-none focus:border-primary font-sans resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCloneModalOpen(false)} className="text-xs h-8">
                  Cancel
                </Button>
                <Button type="submit" variant="premiumGradient" size="sm" disabled={cloningRole} className="text-xs h-8">
                  {cloningRole ? <Loader2 className="w-3 animate-spin" /> : "Clone Role"}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}

// Inner helper profile form component to encapsulate local state updates
function ProfileUpdateForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const result = await api.updateProfile({ fullName, email });
      // Update local storage authState profile
      const current = authState.getProfile();
      if (current) {
        authState.setProfile({
          ...current,
          fullName: result.fullName,
          email: result.email
        });
      }
      toast.success("Profile details saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-[10px] text-muted-foreground font-semibold">My Display Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-[10px] text-muted-foreground font-semibold">Work Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
        />
      </div>
      <Button type="submit" disabled={saving} variant="premiumGradient" className="h-9 w-full text-xs">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Profile Details"}
      </Button>
    </form>
  );
}

// Custom Workspace Customization panel tab
function WorkspaceSettingsPanel() {
  const queryClient = useQueryClient();
  const { data: workspaceSettings } = useQuery({
    queryKey: ["workspace-settings"],
    queryFn: () => api.getWorkspaceSettings(),
    staleTime: 5 * 60 * 1000
  });

  const profile = authState.getProfile();
  const userRole = profile?.role || "";

  const defaultSidebarOrder = [
    "dashboard", "inventory", "ai", "stores", "dealers", "pos", "analytics", "settings"
  ];

  const persistedOrder: string[] = workspaceSettings?.sidebarOrder || [];
  const sidebarOrder: string[] = [...persistedOrder, ...defaultSidebarOrder.filter((id) => !persistedOrder.includes(id))];
  const sidebarFavorites: string[] = workspaceSettings?.sidebarFavorites || [];
  const sidebarHidden: string[] = workspaceSettings?.sidebarHidden || [];

  const updateWorkspaceMutation = async (newSettings: any) => {
    try {
      await api.updateWorkspaceSettings(newSettings);
      queryClient.setQueryData(["workspace-settings"], newSettings);
      toast.success("Workspace layout preferences updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update workspace settings");
    }
  };

  const isLocked = (modId: string) => {
    return !hasModulePermission(modId, userRole);
  };

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

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all workspace navigation configurations to template defaults?")) return;
    try {
      await api.updateWorkspaceSettings({});
      queryClient.invalidateQueries({ queryKey: ["workspace-settings"] });
      toast.success("Workspace layout has been reset to defaults.");
    } catch (err: any) {
      toast.error("Failed to reset layout");
    }
  };

  // Drag and drop settings panel list
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isLocked(sidebarOrder[index])) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    if (isLocked(sidebarOrder[targetIndex])) return;

    const newOrder = [...sidebarOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    updateWorkspaceMutation({
      ...workspaceSettings,
      sidebarOrder: newOrder
    });
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <SectionTitle>Workspace Personalization Settings</SectionTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your navigation sidebar ordering, favorite modules, and active layouts.</p>
        
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="text-xs font-semibold text-foreground">Active Layout Variant</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Your currently configured dashboard template.</p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary font-mono uppercase">
              {workspaceSettings?.activeLayoutName || "Default Layout"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-semibold text-foreground">Reset Personalizations</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Restore all workspace widget structures and sidebars to defaults.</p>
            </div>
            <Button onClick={handleReset} variant="outline" className="h-8 text-xs text-warning border-warning/25 hover:bg-warning/10 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Workspace
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionTitle>Sidebar Module Manager</SectionTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Drag rows to reorder links, toggle visibility, or select favorites.</p>

        <div className="mt-4 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-black/20 pr-1">
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
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center justify-between p-3 text-xs text-foreground transition-all ${
                  locked ? "opacity-35 bg-black/10" : "hover:bg-white/1"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {!locked ? (
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/40" />
                  )}
                  <config.icon className={`w-4 h-4 ${favorite ? "text-warning" : "text-muted-foreground"}`} />
                  <div>
                    <span className={`font-semibold ${hidden ? "line-through text-muted-foreground" : ""}`}>{config.label}</span>
                    {locked && <span className="ml-1.5 text-[8px] text-muted-foreground border border-white/5 bg-white/2 px-1 py-0.5 rounded font-mono font-bold">LOCKED</span>}
                  </div>
                </div>

                {!locked && (
                  <div className="flex items-center gap-2">
                    {/* Accessibility arrows */}
                    <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="text-muted-foreground/60 hover:text-foreground p-1 disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveItem(index, "down")} disabled={index === sidebarOrder.length - 1} className="text-muted-foreground/60 hover:text-foreground p-1 disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>

                    {/* Visibility */}
                    <button
                      onClick={() => toggleVisibility(modId)}
                      title={hidden ? "Show in Navigation" : "Hide in Navigation"}
                      className={`h-7 px-2.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        hidden 
                          ? "bg-white/5 text-muted-foreground border-white/5" 
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Favorite */}
                    <button
                      onClick={() => toggleFavorite(modId)}
                      title={favorite ? "Remove from Favorites" : "Add to Favorites"}
                      className={`h-7 px-2.5 rounded-lg text-[10px] font-semibold border transition-all ${
                        favorite 
                          ? "bg-warning/10 text-warning border-warning/20" 
                          : "bg-white/5 text-muted-foreground border-white/5"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${favorite ? "fill-warning/15" : ""}`} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
