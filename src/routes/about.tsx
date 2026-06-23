import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Users, Shield, Target, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us · NexaStock" },
      { name: "description", content: "Learn about the mission, values, and leadership behind NexaStock operations." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { icon: Target, title: "Mission Driven", desc: "Orchestrate retail operations to be error-free, predictive, and efficient." },
    { icon: Shield, title: "Security First", desc: "Enforce enterprise security policies, database logs, and secure access controls." },
    { icon: Users, title: "Collaborative Intelligence", desc: "Pair state-of-the-art AI recommendations with human logistics expertise." },
    { icon: Award, title: "Excellence Guaranteed", desc: "Build SaaS solutions that help businesses scale securely across multi-store regions." },
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
          <div className="text-xs text-primary uppercase tracking-widest font-semibold">Our Story</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Orchestrating the next generation of retail.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-sans leading-relaxed">
            Founded in 2024, NexaStock was created to solve the fundamental challenges of multi-store retail. 
            We bridge the gap between warehouses and checkout counters with automated, intelligence-driven sync.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mt-16">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-6 border border-white/5 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">{v.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 glass rounded-3xl p-8 border border-white/5 space-y-4 text-center bg-zinc-900/40 backdrop-blur-md"
        >
          <h2 className="font-display text-2xl font-semibold text-white">Join the Retail Revolution</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-sans leading-relaxed">
            Ready to stabilize your stockouts and predict customer demand? Establish your workspace now.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold cursor-pointer active:scale-98 transition-all">
                Get Started Free
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
