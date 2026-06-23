import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { ShoppingCart, Printer, WifiOff, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/platform/pos")({
  head: () => ({
    meta: [
      { title: "Public POS Features · NexaStock" },
      { name: "description", content: "Perform fast cashier checkouts, print thermal receipts, and cache register transactions locally during network outages." },
    ],
  }),
  component: PlatformPosPage,
});

function PlatformPosPage() {
  const features = [
    { icon: ShoppingCart, title: "Blazing Fast Checkout", desc: "Process store transactions in milliseconds with a barcode-scanner-optimized interface." },
    { icon: Printer, title: "Thermal Receipt Printing", desc: "Direct integration with standard ESC/POS thermal printers for fast customer physical printouts." },
    { icon: WifiOff, title: "Offline Resiliency", desc: "Never lose a sale. Transact locally even when internet drops; autosyncs when connectivity returns." }
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
            Point of Sale (POS) Terminals.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-sans leading-relaxed">
            Empower store cashier counters. Make retail checkouts fast, register shifts secure, and sales tracking seamless across your enterprise layout.
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
          <h2 className="font-display text-2xl font-semibold text-white">Full POS Capabilities</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs text-zinc-300 font-sans">
            {[
              "Barcode scanner input focus optimization",
              "Split-payment support (Cash, Card, QR)",
              "Dual offline transaction cache queue",
              "Cashier drawer session opening/closing audits",
              "Custom tax bracket overrides per item type",
              "Automatic thermal receipt print trigger rules"
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
