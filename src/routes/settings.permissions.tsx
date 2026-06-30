import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { Loader2, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/permissions")({
  head: () => ({ meta: [{ title: "Permission Matrix · NexaStock" }] }),
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

    // Only admins can access this
    if (!["business_owner", "super_admin"].includes(role)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: PermissionMatrixPage,
});

function PermissionMatrixPage() {
  const queryClient = useQueryClient();
  const [togglingPermission, setTogglingPermission] = useState<string | null>(null);

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["permission-matrix"],
    queryFn: () => api.getPermissionMatrix()
  });

  const roles = matrixData?.roles || [];
  const allPermissions = matrixData?.permissions || [];

  const handleTogglePermission = async (roleId: string, permissionId: string, currentAllowed: boolean) => {
    setTogglingPermission(`${roleId}-${permissionId}`);
    try {
      await api.togglePermission(roleId, permissionId, !currentAllowed);
      queryClient.invalidateQueries({ queryKey: ["permission-matrix"] });
      toast.success("Permission updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update permission");
    } finally {
      setTogglingPermission(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Permission Matrix" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Permission Matrix" 
      subtitle="Manage fine-grained permissions for each role"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <GlassCard className="p-6 border-primary/20 bg-primary/5">
          <p className="text-xs text-foreground">
            <span className="font-semibold">How it works:</span> Click on any cell to toggle a permission. Green = Allowed, Red = Blocked.
            Changes are applied immediately to all users with that role.
          </p>
        </GlassCard>

        {/* Permission Matrix Table */}
        <GlassCard className="p-6 overflow-x-auto">
          <SectionTitle>Permission Matrix by Role</SectionTitle>
          
          {roles.length === 0 ? (
            <div className="mt-6 text-center py-12 text-muted-foreground">
              No roles found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 font-semibold text-foreground sticky left-0 bg-black/50 z-10">
                      Permission
                    </th>
                    {roles.map((role: any) => (
                      <th key={role.roleId} className="text-center py-3 px-2 font-semibold text-foreground min-w-28">
                        <div className="font-semibold text-[11px]">{role.roleName}</div>
                        <div className="text-[9px] text-muted-foreground font-mono uppercase">{role.roleCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allPermissions.map((permission: any) => {
                    const permName = permission.name || permission.code;
                    const permModule = permission.module || "general";
                    
                    return (
                      <tr key={permission.id} className="hover:bg-white/1">
                        <td className="py-3 px-3 font-medium text-foreground sticky left-0 bg-black/20 z-10">
                          <div className="font-semibold text-[11px]">{permName}</div>
                          <div className="text-[9px] text-muted-foreground font-mono uppercase mt-0.5">
                            {permission.code} · {permModule}
                          </div>
                        </td>
                        {roles.map((role: any) => {
                          const rolePerms = role.permissions || [];
                          const perm = rolePerms.find((p: any) => p.permissionId === permission.id);
                          const allowed = perm?.allowed || false;
                          const isToggling = togglingPermission === `${role.roleId}-${permission.id}`;

                          return (
                            <td key={`${role.roleId}-${permission.id}`} className="text-center py-3 px-2">
                              <button
                                onClick={() => handleTogglePermission(role.roleId, permission.id, allowed)}
                                disabled={isToggling}
                                className={`h-8 w-8 rounded-lg border font-semibold text-[10px] transition-all flex items-center justify-center mx-auto ${
                                  allowed
                                    ? "bg-success/10 text-success border-success/20 hover:bg-success/15"
                                    : "bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10"
                                } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : allowed ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Legend */}
        <GlassCard className="p-6">
          <SectionTitle>Legend</SectionTitle>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs text-foreground">Permission is <span className="font-semibold">Allowed</span> for this role</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center justify-center text-destructive">
                <X className="w-4 h-4" />
              </div>
              <div className="text-xs text-foreground">Permission is <span className="font-semibold">Blocked</span> for this role</div>
            </div>
          </div>
        </GlassCard>

        {/* Module Breakdown */}
        <GlassCard className="p-6">
          <SectionTitle>Permission Modules</SectionTitle>
          <div className="mt-4 space-y-3">
            {(() => {
              const modules = new Map<string, any[]>();
              allPermissions.forEach((p: any) => {
                if (!modules.has(p.module)) {
                  modules.set(p.module, []);
                }
                modules.get(p.module)!.push(p);
              });

              return Array.from(modules.entries()).map(([module, perms]) => (
                <div key={module} className="p-3 rounded-lg bg-black/20 border border-white/5">
                  <div className="text-xs font-semibold text-foreground uppercase mb-2">{module}</div>
                  <div className="space-y-1">
                    {perms.map((p: any) => (
                      <div key={p.id} className="text-[10px] text-muted-foreground flex justify-between">
                        <span>{p.code}</span>
                        <span className="text-muted-foreground/50">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
