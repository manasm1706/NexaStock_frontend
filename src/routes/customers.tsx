import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Quote } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers Case Studies · NexaStock" },
      { name: "description", content: "See how multi-store brands scale their retail operations and reduce stockouts using NexaStock." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const cases = [
    {
      company: "Aura Cosmetics",
      stat: "94% decrease in stockouts",
      desc: "Aura Cosmetics unified their 14 regional flagship stores with their central Mumbai warehouse, using the AI Forecasting Agent to automate reordering.",
      quote: "NexaStock has completely eliminated our inventory blindspots. The AI insights tell us exactly where and when we need to ship products.",
      author: "Priya Sharma, Operations VP"
    },
    {
      company: "Apex Apparel",
      stat: "42% reduction in transfer costs",
      desc: "Apex Apparel optimized their logistics workflow by using the Redistribution Agent to balance clothing stock across Delhi and Bangalore hubs.",
      quote: "Instead of shipping excess items back to the factory, NexaStock's rebalancing ledger routes them to stores where demand is peaking.",
      author: "Rohan Kapoor, Logistics Director"
    }
  ];

  return (
    <main className="min-h-screen text-foreground relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--electric) 20%, transparent), transparent 70%)" }} />
      
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-36 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="text-xs text-primary uppercase tracking-widest font-semibold">Success Stories</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Trusted by the fastest growing retail networks.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-sans leading-relaxed">
            See how modern retail operations leverage our AI-driven features to increase sales velocities and maintain healthy warehouse limits.
          </p>
        </motion.div>

        <div className="mt-16 space-y-8">
          {cases.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass rounded-3xl p-8 border border-white/5 grid md:grid-cols-3 gap-6 items-center"
            >
              <div className="md:col-span-2 space-y-4">
                <div className="text-xs text-primary uppercase tracking-widest font-semibold font-mono">{c.company}</div>
                <h3 className="font-display text-2xl font-bold text-white">{c.stat}</h3>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed">{c.desc}</p>
                
                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex gap-2 text-primary">
                    <Quote className="w-4 h-4 shrink-0 mt-1 opacity-70" />
                    <p className="text-xs italic text-zinc-300 font-sans leading-relaxed">{c.quote}</p>
                  </div>
                  <div className="text-[11px] text-muted-foreground pl-6 font-medium">— {c.author}</div>
                </div>
              </div>

              <div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-6 h-full flex flex-col justify-between text-center select-none shadow-inner">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary mb-2 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-white uppercase tracking-widest">Impact Mapped</div>
                <div className="text-xs text-zinc-500 font-sans mt-2">Continuous stock level sync and demand forecast enabled.</div>
                <div className="pt-4">
                  <Link to="/register">
                    <button className="h-8 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold cursor-pointer active:scale-95 transition-all w-full flex items-center justify-center gap-1">
                      Start Your Story <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
