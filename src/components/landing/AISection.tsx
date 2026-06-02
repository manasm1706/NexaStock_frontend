import { motion } from "motion/react";
import { Sparkles, ArrowUpRight } from "lucide-react";

const insights = [
  { tag: "Stockout risk", text: "Store A will run out of Paracetamol-650 in 4 days.", action: "Auto-transfer 80u" },
  { tag: "Optimization", text: "Move 50 units of Atorva-20 from Store B → Store C.", action: "Approve" },
  { tag: "Demand spike", text: "Mumbai region trending +38% on Apparel SKUs.", action: "Reorder" },
  { tag: "Dead stock", text: "₹2.1L locked in slow SKUs across 4 stores.", action: "Run promo" },
];

export function AISection() {
  return (
    <section id="ai" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--violet) 30%, transparent), transparent 70%)"}} />
      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5"/> NexaStock AI
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            <span className="text-gradient">An operations brain</span><br/>
            that never sleeps.
          </h2>
          <p className="mt-5 text-muted-foreground max-w-md">
            Conversational, explainable, and tuned to your business. Ask "what should I restock this week?" and get a defensible answer with the math behind it.
          </p>

          <div className="mt-8 glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">You</div>
            <div className="text-foreground">What should I restock at the Andheri store this week?</div>
            <div className="mt-4 text-xs text-muted-foreground">NexaStock AI</div>
            <div className="text-foreground/90 text-sm leading-relaxed">
              Based on 28-day velocity and projected demand, restock <b>Atorva-20 (60u)</b>, <b>Pantop-40 (40u)</b>, and <b>Glimer-2 (35u)</b>.
              Confidence <span className="text-primary">94%</span>. Estimated stockout risk averted: 12 days.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((it, i) => (
            <motion.div
              key={it.tag}
              initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}}
              viewport={{once:true}} transition={{delay:i*0.08, duration:0.6}}
              whileHover={{y:-4}}
              className="glass rounded-2xl p-5 shadow-card"
            >
              <div className="text-[10px] uppercase tracking-widest text-primary/80">{it.tag}</div>
              <div className="mt-2 text-sm text-foreground">{it.text}</div>
              <button className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground/90 hover:text-primary transition-colors">
                {it.action} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
