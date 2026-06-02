import { motion } from "motion/react";
import { Brain, Network, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Forecasting that actually learns",
    body: "Per-SKU demand models that adapt to seasonality, promotions and regional behavior — with full explainability.",
    visual: (
      <svg viewBox="0 0 300 120" className="w-full h-32">
        <defs><linearGradient id="ffx" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0.6"/><stop offset="100%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0"/></linearGradient></defs>
        <path d="M0,100 C40,80 60,90 90,60 C120,30 160,55 200,30 C240,10 270,25 300,15 L300,120 L0,120 Z" fill="url(#ffx)" />
        <path d="M0,100 C40,80 60,90 90,60 C120,30 160,55 200,30 C240,10 270,25 300,15" stroke="oklch(0.85 0.16 258)" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    icon: Network,
    title: "Warehouse-first orchestration",
    body: "A central source of truth that routes stock to the right store at the right time, automatically.",
    visual: (
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {Array.from({length:9}).map((_,i)=>(
          <div key={i} className={`h-10 rounded-lg border border-white/10 ${i===4?'bg-primary/30':'bg-white/[0.04]'}`} />
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Analytics for operators",
    body: "Revenue, margin, velocity, dead stock — every metric you need without ten dashboards.",
    visual: (
      <div className="flex items-end gap-1.5 h-32">
        {[40,72,54,90,66,82,48,96,60,78,52,88].map((h,i)=>(
          <div key={i} style={{height:`${h}%`}} className="flex-1 rounded-md bg-gradient-to-t from-primary/30 to-accent/60" />
        ))}
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade, role-aware",
    body: "Granular roles for owners, warehouse, store managers and cashiers. SOC-ready audit logs included.",
    visual: (
      <div className="space-y-2 text-xs">
        {["Owner · full access","Warehouse · stock ops","Store Manager · regional","Cashier · POS only"].map((r,i)=>(
          <div key={r} className="flex items-center justify-between glass rounded-lg px-3 py-2">
            <span className="text-foreground/80">{r}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${['bg-primary','bg-accent','bg-success','bg-warning'][i]}`} />
          </div>
        ))}
      </div>
    ),
  },
];

export function Features() {
  return (
    <section id="platform" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">The platform</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Engineered like a billion-dollar system.</h2>
          <p className="mt-4 text-muted-foreground">Every layer of NexaStock is built for speed, clarity and operational confidence.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.7 }}
              className="glass rounded-3xl p-7 shadow-card relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--electric) 50%, transparent), transparent)"}}/>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              </div>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              <div className="mt-6 rounded-xl bg-black/30 border border-white/5 p-4">
                {f.visual}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
