import { cn } from '@/lib/utils';

export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn('font-display text-3xl md:text-4xl font-semibold tracking-tight', className)}>{children}</h1>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('font-display text-lg md:text-xl font-semibold tracking-tight', className)}>{children}</h2>;
}

export function MetricValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('font-display text-3xl font-semibold tracking-tight', className)}>{children}</div>;
}

export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-xs uppercase tracking-[0.25em] text-muted-foreground', className)}>{children}</p>;
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('text-xs text-muted-foreground', className)}>{children}</span>;
}

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('text-gradient', className)}>{children}</span>;
}
