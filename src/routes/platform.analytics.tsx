import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { TrendingUp, FileText, PieChart, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/platform/analytics")({
  head: () => ({
    meta: [
      { title: "Public Analytics Features · NexaStock" },
      { name: "description", content: "Review revenue ledger statements, track store turnover rates, and export raw CSV/Excel audit logs." },
    ],
  }),
  component: PlatformAnalyticsPage,
});

function PlatformAnalyticsPage() {
  const features = [
    { icon: TrendingUp, title: "Turnover Analytics", desc: "Track average storage days and sell-through rates to minimize stagnant stock hold times." },
    { icon: FileText, title: "Structured PDF & CSV Reports", desc: "Generate print-ready profit summaries, tax statements, and full audit logs at any time." },
    { icon: PieChart, title: "Margin & Profit Tracking", desc: "Analyze profitability per SKU category, location group, or custom tags automatically." }
  ];

  return (
    <main className="min-h-screen text-foreground relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--electric) 20%, transparent), transparent 70%)" }} />
      
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-36 pb-20 relative z-10 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="text-xs text-primary uppercase tracking-widest font-semibold">Platform Module</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Advanced Analytics & Reports.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-sans leading-relaxed">
            Gain complete operational transparency. Query historical margins, track store-by-store sales trends, and build automated reports with ease.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-5 border border-white/5 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white leading-tight">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass rounded-3xl p-8 border border-white/5 space-y-6 bg-zinc-900/40 backdrop-blur-md"
        >
          <h2 className="font-display text-2xl font-semibold text-white">Full Analytics Capabilities</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs text-zinc-300 font-sans">
            {[
              "Daily, weekly, and monthly revenue ledgers",
              "Individual store-level margin comparisons",
              "Raw ledger CSV and Excel export triggers",
              "Year-over-year operational profit audits",
              "Inventory shrink and discrepancy tracking reports",
              "Automated scheduled email report configurations"
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
