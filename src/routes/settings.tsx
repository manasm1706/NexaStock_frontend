import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Building2, Bell, Shield, KeyRound, CreditCard, Users } from "lucide-react";

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

const team = [
  { name: "Jane Doe", role: "Owner", email: "jane@nexastock.io" },
  { name: "Aarav Mehta", role: "Warehouse Manager", email: "aarav@nexastock.io" },
  { name: "Priya Iyer", role: "Store Manager · Pune", email: "priya@nexastock.io" },
  { name: "Rohit Khanna", role: "Analyst", email: "rohit@nexastock.io" },
];

function SettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Configure your NexaStock workspace">
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="space-y-1">
          {sections.map((s, i) => (
            <button
              key={s.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                i === 0 ? "bg-white/[0.05] text-foreground glow-ring" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 shadow-card">
            <div className="font-display text-lg">Organization</div>
            <div className="text-xs text-muted-foreground">Branding and identity for your tenant</div>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {[
                { l: "Legal name", v: "NexaStock Retail Pvt. Ltd." },
                { l: "Display name", v: "NexaStock" },
                { l: "Industry", v: "Pharma · Retail" },
                { l: "Timezone", v: "Asia/Kolkata (UTC+5:30)" },
                { l: "Currency", v: "INR (₹)" },
                { l: "Fiscal year", v: "Apr — Mar" },
              ].map((f) => (
                <div key={f.l}>
                  <div className="text-xs text-muted-foreground">{f.l}</div>
                  <div className="mt-1 h-10 rounded-xl border border-white/10 bg-white/[0.02] px-3 flex items-center text-sm">
                    {f.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-lg">Team & roles</div>
                <div className="text-xs text-muted-foreground">Role-based access control</div>
              </div>
              <button className="h-9 px-4 rounded-xl text-sm bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm">
                Invite member
              </button>
            </div>
            <div className="mt-4 divide-y divide-white/5">
              {team.map((m) => (
                <div key={m.email} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold">
                    {m.name.split(" ").map((p) => p[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-white/10 text-muted-foreground">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
