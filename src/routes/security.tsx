import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Shield, Key, FileCheck, Server, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Policy Compliance · NexaStock" },
      { name: "description", content: "Learn how NexaStock secures multi-tenant data, registers audit events, and maintains active sessions." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const policies = [
    {
      icon: Shield,
      title: "Multi-Tenant Data Isolation",
      desc: "Every database operation enforces strict tenant scopes via Prisma middlewares and Postgres schemas, ensuring organization data never bleeds between accounts."
    },
    {
      icon: Key,
      title: "Session Authentication & Recovery",
      desc: "Auth sessions utilize short-lived JWT access tokens and database-backed long-lived refresh tokens. Session recovery checks active device IDs before token renewal."
    },
    {
      icon: FileCheck,
      title: "Immutable System Audit Trails",
      desc: "Every modification — including logins, inventory adjustments, and checkout transactions — writes an immutable audit event referencing actor IDs and request identifiers."
    },
    {
      icon: Server,
      title: "Infrastructure & Encryption",
      desc: "Passwords are hashed using industry-standard salt algorithms. Data is encrypted at rest and in transit via SSL, hosted on secure Postgres databases with NeonDB replication."
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
          <div className="text-xs text-primary uppercase tracking-widest font-semibold">Security Architecture</div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Security you can verify.
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg font-sans leading-relaxed">
            NexaStock builds on enterprise-grade standards. We guarantee data integrity, full visibility, and strict access controls across your retail operations.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mt-16">
          {policies.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass rounded-2xl p-6 border border-white/5 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 bg-amber-500/5 rounded-2xl p-6 border border-amber-500/20 flex gap-3 text-xs max-w-2xl mx-auto"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-amber-500">Compliance & Password Strength Rules</span>
            <p className="text-zinc-400 font-sans leading-relaxed">
              Administrators can configure organization policies, including minimum password length and symbol requirements, to secure employee accounts. Password history is monitored via cryptographic hashing algorithms.
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
