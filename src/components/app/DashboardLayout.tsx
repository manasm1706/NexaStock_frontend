import { Link, useRouterState } from "@tanstack/react-router";
import { LogoMark, Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import {
  LayoutDashboard, Boxes, Brain, Store, BarChart3, Settings,
  ScanLine, Sparkles, Search, Bell,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { authState } from "@/lib/api/client";
import { ProfileSettingsModal } from "./ProfileSettingsModal";


const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/inventory", icon: Boxes, label: "Inventory" },
  { to: "/ai", icon: Brain, label: "AI Center" },
  { to: "/stores", icon: Store, label: "Stores" },
  { to: "/pos", icon: ScanLine, label: "POS" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function DashboardLayout({
  title, subtitle, actions, children,
}: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profile = authState.getProfile();
  const userInitials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "JD";

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/5 bg-[oklch(0.14_0.012_260)]/60 backdrop-blur-xl p-4">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <LogoMark size={28} />
          <span className="font-semibold tracking-tight">NexaStock</span>
        </Link>
        <div className="mt-6 px-2"><Caption>Workspace</Caption></div>
        <nav className="mt-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-white/[0.05] text-foreground glow-ring"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Sparkles className="w-3.5 h-3.5" /> NexaStock AI
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">Ask anything about your operations.</div>
          <Link to="/ai" className="block mt-3">
            <Button variant="premiumGradient" size="md" className="w-full text-xs">
              Open AI
            </Button>
          </Link>
        </div>
      </aside>

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
