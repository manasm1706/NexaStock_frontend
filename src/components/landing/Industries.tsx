import { Pill, Shirt, ShoppingBasket, Cpu, Truck, Warehouse } from "lucide-react";
import { motion } from "motion/react";

const items = [
  { icon: Pill, label: "Pharmacy Chains", desc: "Expiry, batch & cold-chain visibility." },
  { icon: Shirt, label: "Garments & Apparel", desc: "Size matrix, season demand forecasting." },
  { icon: ShoppingBasket, label: "Grocery", desc: "Perishables, daily replenishment AI." },
  { icon: Cpu, label: "Electronics", desc: "Serialized inventory & warranty tracking." },
  { icon: Truck, label: "FMCG Distribution", desc: "Route planning & sub-distributor flow." },
  { icon: Warehouse, label: "Wholesale", desc: "Bulk orders, B2B price tiers." },
];

export function Industries() {
  return (
    <section id="industries" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Built for every shelf</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">One platform. Every category.</h2>
          <p className="mt-4 text-muted-foreground">NexaStock adapts its intelligence to your industry's economics, lifecycle and unit logic.</p>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 shadow-card hover:shadow-glow-sm transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/25 to-accent/20 border border-white/10">
                <it.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="mt-5 font-display text-lg font-semibold">{it.label}</div>
              <div className="text-sm text-muted-foreground mt-1">{it.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
