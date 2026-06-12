import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.section
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.18 }}
      className={cn('glass rounded-2xl border border-white/10 shadow-card', className)}
    >
      {children}
    </motion.section>
  );
}

export function MetricCard({ label, value, delta, className }: { label: string; value: string; delta?: string; className?: string }) {
  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
      {delta ? <div className="mt-2 text-xs text-success">{delta}</div> : null}
    </GlassCard>
  );
}
