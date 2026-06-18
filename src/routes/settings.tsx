import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import {
  Building2, Users, Shield, Bell, KeyRound, CreditCard, Loader2,
  Lock, Key, Laptop, Info, Plus, Check, Trash2, UserX, UserCheck, RefreshCw, XCircle, LayoutGrid, GripVertical, Star, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { MODULE_REGISTRY, hasModulePermission } from "@/components/app/DashboardLayout";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexaStock" }] }),
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

  const isLoading = loadingTenant || (activeTab === "team" && (loadingTeam || loadingRoles));

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
                            {isOwner && m.id !== localProfile?.id ? (
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
                                    <button onClick={() => handleDeactivateUser(m.id)} title="Deactivate" className="p-1 rounded hover:bg-white/10 text-warning inline-flex"><UserX className="w-3.5 h-3.5" /></button>
                                  )}
                                  {m.status === "disabled" && (
                                    <button onClick={() => handleReactivateUser(m.id)} title="Reactivate" className="p-1 rounded hover:bg-white/10 text-success inline-flex"><UserCheck className="w-3.5 h-3.5" /></button>
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

  const sidebarOrder: string[] = workspaceSettings?.sidebarOrder || [
    "dashboard", "inventory", "ai", "stores", "pos", "analytics", "settings"
  ];
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
