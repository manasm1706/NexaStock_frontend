import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    desc: "For single-store operators getting started.",
    features: ["1 warehouse · 1 store", "Up to 2,000 SKUs", "Core analytics", "Email support"],
  },
  {
    name: "Growth",
    price: "$199",
    desc: "Multi-store retail with AI forecasting on.",
    featured: true,
    features: ["1 warehouse · 10 stores", "Unlimited SKUs", "AI forecasting & redistribution", "POS for every store", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For chains and distributors at scale.",
    features: ["Unlimited warehouses & stores", "SLA & dedicated CSM", "SSO, audit logs, RBAC", "Custom integrations"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Pricing</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Pay for what scales with you.</h2>
          <p className="mt-4 text-muted-foreground">Simple plans. No hidden user fees. Cancel anytime.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {tiers.map(t => (
            <div key={t.name}
              className={`relative glass rounded-3xl p-7 shadow-card ${t.featured ? 'glow-ring' : ''}`}>
              {t.featured && <div className="absolute -top-3 left-7 text-[10px] uppercase tracking-[0.2em] bg-gradient-to-r from-primary to-accent text-primary-foreground px-2.5 py-1 rounded-full">Most popular</div>}
              <div className="font-display text-lg">{t.name}</div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold">{t.price}</span>
                {t.price !== 'Custom' && <span className="text-muted-foreground text-sm">/ month</span>}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{t.desc}</div>
              <Button className={`w-full mt-6 ${t.featured ? 'bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm' : 'bg-white/5 hover:bg-white/10 text-foreground'}`}>
                Choose {t.name}
              </Button>
              <ul className="mt-6 space-y-2.5">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                    <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
