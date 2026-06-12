import { GlassCard } from "@/components/ui/card/GlassCard";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <GlassCard className="w-full max-w-md rounded-3xl p-8 shadow-premium">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </GlassCard>
  );
}
