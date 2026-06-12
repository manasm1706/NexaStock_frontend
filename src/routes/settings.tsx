import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { Building2, Bell, Shield, KeyRound, CreditCard, Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · NexaStock" }] }),
  component: SettingsPage,
});

const sections = [
  { icon: Building2, label: "Organization" },
  { icon: Users, label: "Team & roles" },
  { icon: KeyRound, label: "API & integrations" },
  { icon: Bell, label: "Notifications" },
  { icon: CreditCard, label: "Billing" },
  { icon: Shield, label: "Security" },
];

function SettingsPage() {
  // Fetch tenant info
  const { data: tenantSummary, isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-summary"],
    queryFn: () => api.getTenantSummary()
  });

  // Fetch team members list
  const { data: teamData = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["team-users"],
    queryFn: () => api.getUsers()
  });

  const isLoading = loadingTenant || loadingTeam;

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading settings...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const tenant = tenantSummary?.tenant || {};

  return (
    <DashboardLayout title="Settings" subtitle="Configure your NexaStock workspace">
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="space-y-1">
          {sections.map((s, i) => (
            <button
              key={s.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                i === 0 ? "bg-white/5 text-foreground glow-ring" : "text-muted-foreground hover:text-foreground hover:bg-white/3"
              }`}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <SectionTitle>Organization</SectionTitle>
            <div className="text-xs text-muted-foreground">Branding and identity for your tenant</div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {[
                { l: "Legal name", v: tenant.legalName || "NexaStock Retail Pvt. Ltd." },
                { l: "Display name", v: tenant.name || "NexaStock" },
                { l: "Industry", v: tenant.industry || "Pharma · Retail" },
                { l: "Timezone", v: tenant.timezone || "Asia/Kolkata (UTC+5:30)" },
                { l: "Currency", v: tenant.primaryCurrency || "INR (₹)" },
                { l: "Fiscal year", v: "Apr — Mar" },
              ].map((f) => (
                <div key={f.l}>
                  <div className="text-xs text-muted-foreground">{f.l}</div>
                  <div className="mt-1 h-10 rounded-xl border border-white/10 bg-white/2 px-3 flex items-center text-sm text-foreground">
                    {f.v}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionTitle>Team & roles</SectionTitle>
                <div className="text-xs text-muted-foreground">Role-based access control</div>
              </div>
              <Button variant="premiumGradient" size="md" className="h-9 px-4">Invite member</Button>
            </div>
            <div className="mt-4 divide-y divide-white/5">
              {teamData.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 py-3 text-foreground">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {m.fullName.split(" ").map((p: string) => p[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-white/10 text-muted-foreground">
                    {m.roleLabel || m.role}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
