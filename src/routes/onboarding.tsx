import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, ArrowLeft, Building2, Warehouse, Store, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

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
  const navigate = useNavigate();

  // State variables for wizard data
  const [orgName, setOrgName] = useState("Acme");
  const [legalName, setLegalName] = useState("Acme Retail Pvt. Ltd.");
  const [industry, setIndustry] = useState("Pharma · Retail");
  const [hq, setHq] = useState("Mumbai, India");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [whName, setWhName] = useState("Andheri Central");
  const [whCode, setWhCode] = useState("WH-MUM-01");
  const [whAddress, setWhAddress] = useState("MIDC, Andheri East, Mumbai");
  const [whCapacity, setWhCapacity] = useState("120,000");
  const [whEmail, setWhEmail] = useState("manager@yourco.com");
  const [whPhone, setWhPhone] = useState("+91 98200 12345");

  const [stores, setStores] = useState([
    { name: "Bandra Flagship", code: "ST-MUM-01", city: "Mumbai" },
    { name: "Koramangala", code: "ST-BLR-01", city: "Bengaluru" },
    { name: "Connaught Place", code: "ST-DEL-01", city: "Delhi" },
  ]);

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreCode, setNewStoreCode] = useState("");
  const [newStoreCity, setNewStoreCity] = useState("");
  const [isAddingStore, setIsAddingStore] = useState(false);

  const [aiPreference, setAiPreference] = useState("Co-pilot");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStoreCode || !newStoreCity) {
      toast.error("Please fill in all store fields");
      return;
    }
    setStores([...stores, { name: newStoreName, code: newStoreCode, city: newStoreCity }]);
    setNewStoreName("");
    setNewStoreCode("");
    setNewStoreCity("");
    setIsAddingStore(false);
    toast.success("Store added to plan");
  };

  const handleRemoveStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      const signupFullName = sessionStorage.getItem("nexastock_signup_fullName") || "Owner";
      const signupEmail = sessionStorage.getItem("nexastock_signup_email") || "owner@acme.example";
      const signupPassword = sessionStorage.getItem("nexastock_signup_password") || "password123";

      const payload = {
        organizationName: orgName,
        legalName: legalName,
        industry: industry,
        plan: "professional",
        hq: hq,
        currency: currency,
        timezone: timezone,
        warehouse: {
          name: whName,
          code: whCode,
          address: whAddress,
          capacity: whCapacity,
          email: whEmail,
          phone: whPhone
        },
        stores: stores.map(store => ({
          name: store.name,
          code: store.code,
          city: store.city
        })),
        aiPreference: aiPreference,
        adminUser: {
          fullName: signupFullName,
          email: signupEmail,
          password: signupPassword
        }
      };

      // Perform unified atomic onboarding
      await api.startOnboarding(payload);

      // Clean up session storage
      sessionStorage.removeItem("nexastock_signup_fullName");
      sessionStorage.removeItem("nexastock_signup_email");
      sessionStorage.removeItem("nexastock_signup_company");
      sessionStorage.removeItem("nexastock_signup_password");

      toast.success("Workspace successfully launched!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize workspace");
    } finally {
      setIsLoading(false);
    }
  };

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
                    disabled={isLoading}
                    onClick={() => i <= step && setStep(i)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      active ? "bg-white/5 glow-ring" : "hover:bg-white/3"
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
              {step === 0 && (
                <OrgStep
                  orgName={orgName} setOrgName={setOrgName}
                  legalName={legalName} setLegalName={setLegalName}
                  industry={industry} setIndustry={setIndustry}
                  hq={hq} setHq={setHq}
                  currency={currency} setCurrency={setCurrency}
                  timezone={timezone} setTimezone={setTimezone}
                />
              )}
              {step === 1 && (
                <WarehouseStep
                  whName={whName} setWhName={setWhName}
                  whCode={whCode} setWhCode={setWhCode}
                  whAddress={whAddress} setWhAddress={setWhAddress}
                  whCapacity={whCapacity} setWhCapacity={setWhCapacity}
                  whEmail={whEmail} setWhEmail={setWhEmail}
                  whPhone={whPhone} setWhPhone={setWhPhone}
                />
              )}
              {step === 2 && (
                <StoresStep
                  stores={stores}
                  onRemove={handleRemoveStore}
                  isAddingStore={isAddingStore}
                  setIsAddingStore={setIsAddingStore}
                  newStoreName={newStoreName} setNewStoreName={setNewStoreName}
                  newStoreCode={newStoreCode} setNewStoreCode={setNewStoreCode}
                  newStoreCity={newStoreCity} setNewStoreCity={setNewStoreCity}
                  onAdd={handleAddStore}
                />
              )}
              {step === 3 && (
                <AIStep preference={aiPreference} setPreference={setAiPreference} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || isLoading}
              className="h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            {last ? (
              <button
                disabled={isLoading}
                onClick={handleLaunch}
                className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching...
                  </>
                ) : (
                  <>
                    Launch workspace <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm"
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

interface OrgStepProps {
  orgName: string; setOrgName: (v: string) => void;
  legalName: string; setLegalName: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  hq: string; setHq: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;
  timezone: string; setTimezone: (v: string) => void;
}

function OrgStep({ orgName, setOrgName, legalName, setLegalName, industry, setIndustry, hq, setHq, currency, setCurrency, timezone, setTimezone }: OrgStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Welcome to NexaStock</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Let's set up your organization</h2>
        <p className="text-muted-foreground mt-2 text-sm">This becomes the parent tenant for all your warehouses, stores, and users.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Legal business name</span>
          <input
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Acme Retail Pvt. Ltd."
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Display name</span>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Industry</span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Headquarters</span>
          <input
            value={hq}
            onChange={(e) => setHq(e.target.value)}
            placeholder="Mumbai, India"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Currency</span>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Timezone</span>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
      </div>
    </>
  );
}

interface WarehouseStepProps {
  whName: string; setWhName: (v: string) => void;
  whCode: string; setWhCode: (v: string) => void;
  whAddress: string; setWhAddress: (v: string) => void;
  whCapacity: string; setWhCapacity: (v: string) => void;
  whEmail: string; setWhEmail: (v: string) => void;
  whPhone: string; setWhPhone: (v: string) => void;
}

function WarehouseStep({ whName, setWhName, whCode, setWhCode, whAddress, setWhAddress, whCapacity, setWhCapacity, whEmail, setWhEmail, whPhone, setWhPhone }: WarehouseStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Step 2</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Add your first warehouse</h2>
        <p className="text-muted-foreground mt-2 text-sm">Warehouses are the source of truth for inventory and redistribution decisions.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Warehouse name</span>
          <input
            value={whName}
            onChange={(e) => setWhName(e.target.value)}
            placeholder="Andheri Central"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Code</span>
          <input
            value={whCode}
            onChange={(e) => setWhCode(e.target.value)}
            placeholder="WH-MUM-01"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Address</span>
          <input
            value={whAddress}
            onChange={(e) => setWhAddress(e.target.value)}
            placeholder="MIDC, Andheri East, Mumbai"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Capacity (units)</span>
          <input
            value={whCapacity}
            onChange={(e) => setWhCapacity(e.target.value)}
            placeholder="120,000"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Manager email</span>
          <input
            value={whEmail}
            onChange={(e) => setWhEmail(e.target.value)}
            placeholder="manager@yourco.com"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Phone</span>
          <input
            value={whPhone}
            onChange={(e) => setWhPhone(e.target.value)}
            placeholder="+91 98XX XXX XXX"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </label>
      </div>
    </>
  );
}

interface StoresStepProps {
  stores: Array<{ name: string; code: string; city: string }>;
  onRemove: (index: number) => void;
  isAddingStore: boolean;
  setIsAddingStore: (v: boolean) => void;
  newStoreName: string; setNewStoreName: (v: string) => void;
  newStoreCode: string; setNewStoreCode: (v: string) => void;
  newStoreCity: string; setNewStoreCity: (v: string) => void;
  onAdd: (e: React.FormEvent) => void;
}

function StoresStep({ stores, onRemove, isAddingStore, setIsAddingStore, newStoreName, setNewStoreName, newStoreCode, setNewStoreCode, newStoreCity, setNewStoreCity, onAdd }: StoresStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Step 3</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Connect your retail stores</h2>
        <p className="text-muted-foreground mt-2 text-sm">Add as many as you'd like — you can bulk-import later via CSV or API.</p>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {stores.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{s.name} <span className="text-xs text-muted-foreground">({s.code})</span></div>
              <div className="text-xs text-muted-foreground">{s.city}</div>
            </div>
            <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-success/30 text-success bg-success/10 mr-2">
              Linked
            </span>
            <button
              onClick={() => onRemove(i)}
              className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {isAddingStore ? (
          <form onSubmit={onAdd} className="glass rounded-2xl p-4 border border-primary/20 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Store Name (e.g. Bandra Flagship)"
                className="w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-xs outline-none focus:border-primary/50"
                required
              />
              <input
                value={newStoreCode}
                onChange={(e) => setNewStoreCode(e.target.value)}
                placeholder="Code (e.g. ST-MUM-01)"
                className="w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-xs outline-none focus:border-primary/50"
                required
              />
              <input
                value={newStoreCity}
                onChange={(e) => setNewStoreCity(e.target.value)}
                placeholder="City (e.g. Mumbai)"
                className="w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-xs outline-none focus:border-primary/50"
                required
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAddingStore(false)}
                className="h-8 px-3 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 px-3 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                Add store
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingStore(true)}
            className="w-full h-12 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add another store
          </button>
        )}
      </div>
    </>
  );
}

interface AIStepProps {
  preference: string;
  setPreference: (v: string) => void;
}

function AIStep({ preference, setPreference }: AIStepProps) {
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
        {opts.map((o) => {
          const selected = preference === o.t;
          return (
            <button
              key={o.t}
              onClick={() => setPreference(o.t)}
              className={`glass rounded-2xl p-5 text-left relative transition-all ${
                selected ? "glow-ring border-primary bg-primary/5" : "hover:border-white/20"
              }`}
            >
              {o.rec && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                  Recommended
                </span>
              )}
              <div className="font-display text-lg">{o.t}</div>
              <div className="text-xs text-muted-foreground mt-1.5">{o.d}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
