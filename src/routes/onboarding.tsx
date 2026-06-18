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
  { key: "business", label: "Business Type", icon: Sparkles },
];

import { BUSINESS_TYPES } from "@/lib/constants";

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const last = step === steps.length - 1;
  const navigate = useNavigate();

  // State variables for wizard data
  const [orgName, setOrgName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("");
  const [hq, setHq] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [newWhName, setNewWhName] = useState("");
  const [newWhCode, setNewWhCode] = useState("");
  const [newWhAddress, setNewWhAddress] = useState("");
  const [newWhCapacity, setNewWhCapacity] = useState("");
  const [newWhEmail, setNewWhEmail] = useState("");
  const [newWhPhone, setNewWhPhone] = useState("");
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false);

  const [stores, setStores] = useState<any[]>([]);

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreCode, setNewStoreCode] = useState("");
  const [newStoreCity, setNewStoreCity] = useState("");
  const [isAddingStore, setIsAddingStore] = useState(false);

  const [businessType, setBusinessType] = useState("electronics");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName || !newWhCode) {
      toast.error("Name and Code are required for warehouse");
      return;
    }
    setWarehouses([...warehouses, {
      name: newWhName,
      code: newWhCode,
      address: newWhAddress,
      capacity: newWhCapacity,
      email: newWhEmail,
      phone: newWhPhone
    }]);
    setNewWhName(""); setNewWhCode(""); setNewWhAddress(""); setNewWhCapacity(""); setNewWhEmail(""); setNewWhPhone("");
    setIsAddingWarehouse(false);
    toast.success("Warehouse added");
  };

  const handleRemoveWarehouse = (index: number) => {
    setWarehouses(warehouses.filter((_, i) => i !== index));
  };

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
    toast.success("Store added");
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
        industry: businessType,
        plan: "professional",
        hq: hq,
        currency: currency,
        timezone: timezone,
        warehouses: warehouses,
        stores: stores.map(store => ({
          name: store.name,
          code: store.code,
          city: store.city
        })),
        businessType: businessType,
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

  const currentType = BUSINESS_TYPES.find(t => t.id === businessType) || BUSINESS_TYPES[0];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-linear-to-br ${currentType.color}`}>
      <header className="px-6 py-5 flex items-center gap-3 backdrop-blur-md bg-black/5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-semibold tracking-tight">NexaStock <span className="text-xs font-normal text-muted-foreground ml-1">[{currentType.label}]</span></span>
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
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${active ? "bg-white/5 glow-ring" : "hover:bg-white/3"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs ${done ? "bg-primary border-primary text-primary-foreground" :
                      active ? "border-primary text-primary" :
                        "border-white/15 text-muted-foreground"
                      }`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <div className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.key === "org" ? "Tell us about your business" :
                          s.key === "warehouse" ? "Manage your inventory storage" :
                            s.key === "stores" ? "Connect retail stores" :
                              "Choose your industry wrapper"}
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
                  warehouses={warehouses}
                  onRemove={handleRemoveWarehouse}
                  isAdding={isAddingWarehouse}
                  setIsAdding={setIsAddingWarehouse}
                  name={newWhName} setName={setNewWhName}
                  code={newWhCode} setCode={setNewWhCode}
                  address={newWhAddress} setAddress={setNewWhAddress}
                  capacity={newWhCapacity} setCapacity={setNewWhCapacity}
                  email={newWhEmail} setEmail={setNewWhEmail}
                  phone={newWhPhone} setPhone={setNewWhPhone}
                  onAdd={handleAddWarehouse}
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
                <BusinessTypeStep businessType={businessType} setBusinessType={setBusinessType} />
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
  warehouses: any[];
  onRemove: (i: number) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  name: string; setName: (v: string) => void;
  code: string; setCode: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  capacity: string; setCapacity: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  onAdd: (e: React.FormEvent) => void;
}

function WarehouseStep({ warehouses, onRemove, isAdding, setIsAdding, name, setName, code, setCode, address, setAddress, capacity, setCapacity, email, setEmail, phone, setPhone, onAdd }: WarehouseStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Step 2</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Configure Warehouses</h2>
        <p className="text-muted-foreground mt-2 text-sm">Add one or more warehouses. You can also skip this if you're store-only.</p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {warehouses.map((wh, i) => (
          <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
              <Warehouse className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{wh.name} <span className="text-xs text-muted-foreground">({wh.code})</span></div>
              <div className="text-xs text-muted-foreground">{wh.address || "No address"}</div>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {isAdding ? (
          <form onSubmit={onAdd} className="glass rounded-2xl p-6 border border-primary/20 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] uppercase text-muted-foreground">Warehouse name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Central Hub" className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50" required />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase text-muted-foreground">Code</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-001" className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50" required />
              </label>
              <label className="block col-span-2">
                <span className="text-[10px] uppercase text-muted-foreground">Address</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Storage Ln..." className="mt-1 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50" />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Add Warehouse</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full h-14 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 flex items-center justify-center gap-2 transition-colors bg-white/2"
          >
            <Plus className="w-4 h-4" /> Add a warehouse
          </button>
        )}
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

interface BusinessTypeStepProps {
  businessType: string;
  setBusinessType: (v: string) => void;
}

function BusinessTypeStep({ businessType, setBusinessType }: BusinessTypeStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest">Final step</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight">Select your business wrapper</h2>
        <p className="text-muted-foreground mt-2 text-sm">We'll tailor the interface and workflows to match your industry needs.</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {BUSINESS_TYPES.map((t) => {
          const selected = businessType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setBusinessType(t.id)}
              className={`glass rounded-2xl p-5 text-left relative transition-all group ${selected ? "glow-ring border-primary bg-white/10" : "hover:border-white/20"
                }`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{t.icon}</div>
              <div className="font-display text-xl">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-1">Specialized {t.label.toLowerCase()} inventory logic and theme.</div>
              {selected && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </>
  );
}
