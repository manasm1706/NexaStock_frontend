import { motion } from "motion/react";

export function AnalyticsBars({ data, color = "from-primary to-accent" }: { data: { name: string; v: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{d.name}</span>
            <span className="text-foreground">{d.v}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.v / max) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full bg-linear-to-r ${color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
