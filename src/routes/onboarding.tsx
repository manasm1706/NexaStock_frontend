import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, ArrowLeft, Building2, Warehouse, Store, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started · NexaStock" }] }),
  component: OnboardingPage,
});

const steps = [
  { key: "org", label: "Organization", icon: Building2 },
  { key: "warehouse", label: "Warehouse", icon: Warehouse },
  { key: "stores", label: "Stores", icon: Store },
  { key: "ai", label: "AI preferences", icon: Sparkles },
];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const last = step === steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-semibold tracking-tight">NexaStock</span>
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
      </header>

      <div className="flex-1 grid lg:grid-cols-[280px_1fr] gap-0">
        {/* Stepper */}
        <aside className="hidden lg:block border-r border-white/5 p-8">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Setup</div>
          <ol className="mt-4 space-y-1">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => i <= step && setStep(i)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      active ? "bg-white/[0.05] glow-ring" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs ${
                      done ? "bg-primary border-primary text-primary-foreground" :
                      active ? "border-primary text-primary" :
                      "border-white/15 text-muted-foreground"
                    }`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <div className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.key === "org" ? "Tell us about your business" :
                         s.key === "warehouse" ? "Add your first warehouse" :
                         s.key === "stores" ? "Connect retail stores" :
                         "Tune the AI brain"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Content */}
        <main className="p-6 lg:p-12 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {step === 0 && <OrgStep />}
              {step === 1 && <WarehouseStep />}
              {step === 2 && <StoresStep />}
              {step === 3 && <AIStep />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            {last ? (
              <Link to="/dashboard">
                <button className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm">
                  Launch workspace <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value }: { label: string; placeholder?: string; value?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
      />
    </label>
  );
}

function OrgStep() {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Welcome to NexaStock</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Let's set up your organization</h2>
        <p className="text-muted-foreground mt-2 text-sm">This becomes the parent tenant for all your warehouses, stores, and users.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Legal business name" placeholder="Acme Retail Pvt. Ltd." />
        <Field label="Display name" placeholder="Acme" />
        <Field label="Industry" value="Pharma · Retail" />
        <Field label="Headquarters" placeholder="Mumbai, India" />
        <Field label="Currency" value="INR (₹)" />
        <Field label="Timezone" value="Asia/Kolkata" />
      </div>
    </>
  );
}

function WarehouseStep() {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Step 2</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Add your first warehouse</h2>
        <p className="text-muted-foreground mt-2 text-sm">Warehouses are the source of truth for inventory and redistribution decisions.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Warehouse name" placeholder="Andheri Central" />
        <Field label="Code" placeholder="WH-MUM-01" />
        <Field label="Address" placeholder="MIDC, Andheri East, Mumbai" />
        <Field label="Capacity (units)" placeholder="120,000" />
        <Field label="Manager email" placeholder="manager@yourco.com" />
        <Field label="Phone" placeholder="+91 98XX XXX XXX" />
      </div>
    </>
  );
}

function StoresStep() {
  const presets = [
    { name: "Bandra Flagship", city: "Mumbai" },
    { name: "Koramangala", city: "Bengaluru" },
    { name: "Connaught Place", city: "Delhi" },
  ];
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Step 3</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Connect your retail stores</h2>
        <p className="text-muted-foreground mt-2 text-sm">Add as many as you'd like — you can bulk-import later via CSV or API.</p>
      </div>
      <div className="space-y-3">
        {presets.map((s, i) => (
          <div key={s.name} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.city}</div>
            </div>
            <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-success/30 text-success bg-success/10">
              Linked
            </span>
          </div>
        ))}
        <button className="w-full h-12 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30">
          + Add another store
        </button>
      </div>
    </>
  );
}

function AIStep() {
  const opts = [
    { t: "Autonomous", d: "AI executes redistributions and reorders automatically" },
    { t: "Co-pilot", d: "AI suggests, you approve every action", rec: true },
    { t: "Insights only", d: "Get insights without any automated actions" },
  ];
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Final step</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Tune your AI brain</h2>
        <p className="text-muted-foreground mt-2 text-sm">Choose how much autonomy NexaStock has across your operations. You can change this later.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {opts.map((o) => (
          <button
            key={o.t}
            className={`glass rounded-2xl p-5 text-left relative ${o.rec ? "glow-ring" : ""}`}
          >
            {o.rec && (
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                Recommended
              </span>
            )}
            <div className="font-display text-lg">{o.t}</div>
            <div className="text-xs text-muted-foreground mt-1.5">{o.d}</div>
          </button>
        ))}
      </div>
    </>
  );
}
