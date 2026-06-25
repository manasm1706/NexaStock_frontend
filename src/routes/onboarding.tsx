import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand/Logo";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Warehouse, 
  Store, 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2, 
  Upload, 
  Download, 
  FileSpreadsheet,
  AlertTriangle,
  LayoutGrid
} from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { BUSINESS_TYPES } from "@/lib/constants";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started · NexaStock" }] }),
  component: OnboardingPage,
});

const steps = [
  { key: "org", label: "Organization", icon: Building2 },
  { key: "warehouse", label: "Warehouse", icon: Warehouse },
  { key: "stores", label: "Stores", icon: Store },
  { key: "business", label: "Business Type", icon: Sparkles },
  { key: "features", label: "Choose Features", icon: LayoutGrid },
];

// Browser template downloaders
const downloadCSVTemplate = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const headers = "SKU,Product Name,Category,Quantity,Unit,Purchase Price,Selling Price\n";
  const row = "MED-PARA-500,Paracetamol 500mg Tablets,Pharmacy,100,box,35,48\n";
  const blob = new Blob([headers + row], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "inventory-template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("CSV template downloaded!");
};

const downloadXLSXTemplate = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const data = [
    ["SKU", "Product Name", "Category", "Quantity", "Unit", "Purchase Price", "Selling Price"],
    ["MED-PARA-500", "Paracetamol 500mg Tablets", "Pharmacy", 100, "box", 35, 48]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "inventory-template.xlsx");
  toast.success("XLSX template downloaded!");
};

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const last = step === steps.length - 1;
  const navigate = useNavigate();

  // Onboarding Wizard Data
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
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "inventory", "pos", "analytics", "ai", "stores", "team", "notifications"
  ]);

  // Validation errors states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whErrors, setWhErrors] = useState<Record<string, string>>({});
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({});

  // Inventory Upload states (Temporary storage for the one being added)
  const [whInventory, setWhInventory] = useState<any[]>([]);
  const [storeInventory, setStoreInventory] = useState<any[]>([]);
  const [whUploadPreview, setWhUploadPreview] = useState<any>(null);
  const [storeUploadPreview, setStoreUploadPreview] = useState<any>(null);
  const [whUploadConfirmed, setWhUploadConfirmed] = useState(false);
  const [storeUploadConfirmed, setStoreUploadConfirmed] = useState(false);

  const validateOrgStep = () => {
    const errs: Record<string, string> = {};
    if (!orgName.trim()) errs.orgName = "Organization display name is required";
    if (!legalName.trim()) errs.legalName = "Legal business name is required";
    if (!industry.trim()) errs.industry = "Industry description is required";
    if (!currency.trim()) errs.currency = "Currency is required";
    if (!timezone.trim()) errs.timezone = "Timezone is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    setErrors({});
    if (step === 0) {
      if (!validateOrgStep()) {
        toast.error("Please fill in all required organization fields.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newWhName.trim()) errs.name = "Warehouse name is required";
    if (!newWhCode.trim()) errs.code = "Warehouse code is required";
    
    if (Object.keys(errs).length > 0) {
      setWhErrors(errs);
      toast.error("Please fill in required warehouse details.");
      return;
    }

    const trimmedCode = newWhCode.trim().toLowerCase();
    const isCodeWhDuplicate = warehouses.some(w => w.code.trim().toLowerCase() === trimmedCode);
    const isCodeStoreDuplicate = stores.some(s => s.code.trim().toLowerCase() === trimmedCode);
    if (isCodeWhDuplicate || isCodeStoreDuplicate) {
      setWhErrors({ code: "This code is already assigned to a store or warehouse." });
      toast.error("Code duplication found. Please specify a unique location code.");
      return;
    }

    if (whUploadPreview && whUploadPreview.errors.length > 0) {
      toast.error("Please fix spreadsheet validation errors or clear the file.");
      return;
    }

    if (whUploadPreview && whUploadPreview.total > 0 && !whUploadConfirmed) {
      toast.error("Please confirm the imported inventory data.");
      return;
    }

    setWarehouses([...warehouses, {
      name: newWhName,
      code: newWhCode,
      address: newWhAddress,
      capacity: newWhCapacity,
      email: newWhEmail,
      phone: newWhPhone,
      inventory: whUploadPreview && whUploadConfirmed ? whInventory : []
    }]);

    // Reset form
    setNewWhName(""); setNewWhCode(""); setNewWhAddress(""); setNewWhCapacity(""); setNewWhEmail(""); setNewWhPhone("");
    setWhInventory([]);
    setWhUploadPreview(null);
    setWhUploadConfirmed(false);
    setWhErrors({});
    setIsAddingWarehouse(false);
    toast.success("Warehouse added successfully!");
  };

  const handleRemoveWarehouse = (index: number) => {
    setWarehouses(warehouses.filter((_, i) => i !== index));
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newStoreName.trim()) errs.name = "Store name is required";
    if (!newStoreCode.trim()) errs.code = "Store code is required";
    if (!newStoreCity.trim()) errs.city = "City is required";
    
    if (Object.keys(errs).length > 0) {
      setStoreErrors(errs);
      toast.error("Please fill in required store details.");
      return;
    }

    const trimmedCode = newStoreCode.trim().toLowerCase();
    const isCodeWhDuplicate = warehouses.some(w => w.code.trim().toLowerCase() === trimmedCode);
    const isCodeStoreDuplicate = stores.some(s => s.code.trim().toLowerCase() === trimmedCode);
    if (isCodeWhDuplicate || isCodeStoreDuplicate) {
      setStoreErrors({ code: "This code is already assigned to a store or warehouse." });
      toast.error("Code duplication found. Please specify a unique location code.");
      return;
    }

    if (storeUploadPreview && storeUploadPreview.errors.length > 0) {
      toast.error("Please fix spreadsheet validation errors or clear the file.");
      return;
    }

    if (storeUploadPreview && storeUploadPreview.total > 0 && !storeUploadConfirmed) {
      toast.error("Please confirm the imported inventory data.");
      return;
    }

    setStores([...stores, { 
      name: newStoreName, 
      code: newStoreCode, 
      city: newStoreCity,
      inventory: storeUploadPreview && storeUploadConfirmed ? storeInventory : []
    }]);

    // Reset form
    setNewStoreName(""); setNewStoreCode(""); setNewStoreCity("");
    setStoreInventory([]);
    setStoreUploadPreview(null);
    setStoreUploadConfirmed(false);
    setStoreErrors({});
    setIsAddingStore(false);
    toast.success("Store added successfully!");
  };

  const handleRemoveStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  // Submission progress stage
  const [launchStage, setLaunchStage] = useState("");

  // Map backend error codes/messages to user-friendly messages
  const mapOnboardingError = (err: any): string => {
    const msg = (err?.message || "").toLowerCase();
    const code = err?.code || "";

    if (code === "DUPLICATE_RECORD" || msg.includes("already registered") || msg.includes("already exists")) {
      if (msg.includes("email")) return "This email address is already registered. Please use a different email.";
      if (msg.includes("organization") || msg.includes("slug")) return "An organization with this name already exists. Please choose a different name.";
      if (msg.includes("store")) return "A store with this code already exists. Please use a unique store code.";
      if (msg.includes("warehouse")) return "A warehouse with this code already exists. Please use a unique warehouse code.";
      return err.message || "A record with this data already exists.";
    }
    if (code === "VALIDATION_ERROR" || msg.includes("validation")) return "Please review the highlighted fields and correct any errors.";
    if (code === "DATABASE_ERROR" || msg.includes("database")) return "We couldn't create your organization right now. Please try again in a few moments.";
    return err?.message || "Something went wrong during workspace setup. Please try again.";
  };

  const handleLaunch = async () => {
    setErrors({});
    if (businessType === "other" && !customBusinessType.trim()) {
      setErrors({ customBusinessType: "Please specify your business type" });
      toast.error("Please specify your custom business type.");
      return;
    }

    setIsLoading(true);
    try {
      const googleSignupStr = sessionStorage.getItem("nexastock_google_signup");
      const googleSignupData = googleSignupStr ? JSON.parse(googleSignupStr) : null;

      const signupFullName = googleSignupData?.fullName || sessionStorage.getItem("nexastock_signup_fullName") || "Owner";
      const signupEmail = googleSignupData?.email || sessionStorage.getItem("nexastock_signup_email") || "owner@acme.example";
      const signupPassword = googleSignupData ? undefined : (sessionStorage.getItem("nexastock_signup_password") || "password123");

      const finalBusiness = businessType === "other" ? customBusinessType : businessType;

      const payload = {
        organizationName: orgName,
        legalName: legalName,
        industry: finalBusiness,
        plan: "professional",
        hq: hq,
        currency: currency,
        timezone: timezone,
        warehouses: warehouses,
        stores: stores,
        businessType: finalBusiness,
        selectedFeatures: selectedFeatures,
        adminUser: {
          fullName: signupFullName,
          email: signupEmail,
          password: signupPassword,
          googleId: googleSignupData?.googleId
        }
      };

      setLaunchStage("Creating Organization...");
      // Small artificial delay so stage is visible
      await new Promise(r => setTimeout(r, 400));

      setLaunchStage("Setting Up Stores & Warehouses...");
      await new Promise(r => setTimeout(r, 300));

      setLaunchStage("Configuring Inventory...");
      await api.startOnboarding(payload);

      setLaunchStage("Finalizing Workspace...");
      await new Promise(r => setTimeout(r, 300));

      sessionStorage.removeItem("nexastock_signup_fullName");
      sessionStorage.removeItem("nexastock_signup_email");
      sessionStorage.removeItem("nexastock_signup_company");
      sessionStorage.removeItem("nexastock_signup_password");
      sessionStorage.removeItem("nexastock_google_signup");

      toast.success("Workspace successfully launched!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const userMessage = mapOnboardingError(err);
      toast.error(userMessage);

      // If it's a duplicate email error, highlight it
      if (userMessage.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, adminEmail: userMessage }));
      }
      if (userMessage.toLowerCase().includes("organization")) {
        setErrors(prev => ({ ...prev, orgName: userMessage }));
        setStep(0);
      }
      if (userMessage.toLowerCase().includes("store")) {
        setStoreErrors({ code: userMessage });
        setStep(2);
      }
      if (userMessage.toLowerCase().includes("warehouse")) {
        setWhErrors({ code: userMessage });
        setStep(1);
      }
    } finally {
      setIsLoading(false);
      setLaunchStage("");
    }
  };

  const currentType = BUSINESS_TYPES.find(t => t.id === businessType) || BUSINESS_TYPES[0];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 bg-linear-to-br ${currentType.color}`}>
      <header className="px-6 py-5 flex items-center gap-3 backdrop-blur-md bg-black/5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-semibold tracking-tight text-foreground">
            NexaStock <span className="text-xs font-normal text-muted-foreground ml-1">[{currentType.label}]</span>
          </span>
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
      </header>

      <div className="flex-1 grid lg:grid-cols-[280px_1fr] gap-0">
        <aside className="hidden lg:block border-r border-white/5 p-8 bg-black/10">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Setup Progress</div>
          <ol className="mt-4 space-y-1">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key}>
                  <button
                    disabled={isLoading}
                    onClick={() => {
                      if (i <= step) {
                        setStep(i);
                        setErrors({});
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      active ? "bg-white/5 glow-ring" : "hover:bg-white/3"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold ${
                      done ? "bg-primary border-primary text-primary-foreground" :
                      active ? "border-primary text-primary" :
                      "border-white/15 text-muted-foreground"
                    }`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <div className={`text-sm ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s.label}</div>
                      <div className="text-[11px] text-muted-foreground/80">
                        {s.key === "org" ? "Establish organization" :
                         s.key === "warehouse" ? "Manage warehouses & stock" :
                         s.key === "stores" ? "Connect stores & stock" :
                         s.key === "business" ? "Choose wrapper logic" :
                         "Select enabled modules"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <main className={cn("p-6 lg:p-12 overflow-y-auto transition-all duration-300 w-full flex-1", (step === 1 || step === 2) ? "max-w-6xl" : "max-w-3xl")}>
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
                  errors={errors}
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
                  errors={whErrors}
                  inventory={whInventory}
                  setInventory={setWhInventory}
                  preview={whUploadPreview}
                  setPreview={setWhUploadPreview}
                  confirmed={whUploadConfirmed}
                  setConfirmed={setWhUploadConfirmed}
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
                  errors={storeErrors}
                  inventory={storeInventory}
                  setInventory={setStoreInventory}
                  preview={storeUploadPreview}
                  setPreview={setStoreUploadPreview}
                  confirmed={storeUploadConfirmed}
                  setConfirmed={setStoreUploadConfirmed}
                />
              )}
              {step === 3 && (
                <BusinessTypeStep 
                  businessType={businessType} 
                  setBusinessType={setBusinessType} 
                  customBusinessType={customBusinessType}
                  setCustomBusinessType={setCustomBusinessType}
                  errors={errors}
                />
              )}
              {step === 4 && (
                <FeaturesStep 
                  selectedFeatures={selectedFeatures} 
                  setSelectedFeatures={setSelectedFeatures} 
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
            <button
              onClick={() => {
                setErrors({});
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0 || isLoading}
              className="h-10 px-4 rounded-xl text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/3 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            {last ? (
              <button
                disabled={isLoading}
                onClick={handleLaunch}
                className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm cursor-pointer font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {launchStage || "Launching..."}
                  </>
                ) : (
                  <>
                    Launch workspace <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="h-10 px-5 rounded-xl text-sm inline-flex items-center gap-2 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm cursor-pointer font-medium"
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
  errors: Record<string, string>;
}

function OrgStep({ orgName, setOrgName, legalName, setLegalName, industry, setIndustry, hq, setHq, currency, setCurrency, timezone, setTimezone, errors }: OrgStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest font-semibold">Welcome to NexaStock</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight text-foreground font-semibold">Let's set up your organization</h2>
        <p className="text-muted-foreground mt-2 text-sm">This becomes the parent tenant for all your warehouses, stores, and users.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            Legal business name <span className="text-red-500 font-bold">*</span>
          </span>
          <input
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Acme Retail Pvt. Ltd."
            className={cn(
              "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
              errors.legalName 
                ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            )}
            required
          />
          {errors.legalName && <p className="text-xs font-semibold text-destructive mt-1.5">{errors.legalName}</p>}
        </label>
        
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            Display name <span className="text-red-500 font-bold">*</span>
          </span>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme"
            className={cn(
              "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
              errors.orgName 
                ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            )}
            required
          />
          {errors.orgName && <p className="text-xs font-semibold text-destructive mt-1.5">{errors.orgName}</p>}
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            Industry <span className="text-red-500 font-bold">*</span>
          </span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Pharmaceuticals, Groceries, Clothing"
            className={cn(
              "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
              errors.industry 
                ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            )}
            required
          />
          {errors.industry && <p className="text-xs font-semibold text-destructive mt-1.5">{errors.industry}</p>}
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground font-medium">Headquarters (City, Country)</span>
          <input
            value={hq}
            onChange={(e) => setHq(e.target.value)}
            placeholder="Mumbai, India"
            className="mt-1.5 w-full h-11 rounded-xl border border-white/10 bg-white/2 px-3.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            Currency <span className="text-red-500 font-bold">*</span>
          </span>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="INR, USD, EUR"
            className={cn(
              "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
              errors.currency 
                ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            )}
            required
          />
          {errors.currency && <p className="text-xs font-semibold text-destructive mt-1.5">{errors.currency}</p>}
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            Timezone <span className="text-red-500 font-bold">*</span>
          </span>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Kolkata, UTC"
            className={cn(
              "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
              errors.timezone 
                ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            )}
            required
          />
          {errors.timezone && <p className="text-xs font-semibold text-destructive mt-1.5">{errors.timezone}</p>}
        </label>
      </div>
    </>
  );
}

// Reusable Inventory Import Dropzone Component
interface InventoryImportDropzoneProps {
  inventory: any[];
  setInventory: (v: any[]) => void;
  preview: any;
  setPreview: (v: any) => void;
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
  isLarge?: boolean;
}

function InventoryImportDropzone({ inventory, setInventory, preview, setPreview, confirmed, setConfirmed, isLarge }: InventoryImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      parseFile(files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInventory([]);
    setPreview(null);
    setConfirmed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rows.length === 0) {
          setPreview({ total: 0, new: 0, errors: ["Spreadsheet has no content."], filename: file.name });
          return;
        }

        const headers = (rows[0] as string[]).map(h => String(h || "").trim().toLowerCase());
        const requiredHeaders = ["sku", "product name", "category", "quantity", "unit", "purchase price", "selling price"];
        const missing = requiredHeaders.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          const formatted = missing.map(m => m.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
          setPreview({
            total: 0,
            new: 0,
            errors: [`Missing required columns: ${formatted.join(", ")}`],
            filename: file.name
          });
          return;
        }

        const skuIdx = headers.indexOf("sku");
        const nameIdx = headers.indexOf("product name");
        const catIdx = headers.indexOf("category");
        const qtyIdx = headers.indexOf("quantity");
        const unitIdx = headers.indexOf("unit");
        const purIdx = headers.indexOf("purchase price");
        const selIdx = headers.indexOf("selling price");

        const items: any[] = [];
        const errs: string[] = [];
        const skus = new Set<string>();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[];
          if (!row || row.length === 0 || row.every(c => c === undefined || c === null || String(c).trim() === "")) {
            continue;
          }

          const rowNum = i + 1;
          const sku = String(row[skuIdx] || "").trim();
          const name = String(row[nameIdx] || "").trim();
          const category = String(row[catIdx] || "").trim();
          const qtyVal = row[qtyIdx];
          const unit = String(row[unitIdx] || "").trim();
          const purVal = row[purIdx];
          const selVal = row[selIdx];

          if (!sku) errs.push(`Row ${rowNum}: SKU is missing.`);
          if (!name) errs.push(`Row ${rowNum}: Product Name is missing.`);
          if (!category) errs.push(`Row ${rowNum}: Category is missing.`);
          if (!unit) errs.push(`Row ${rowNum}: Unit is missing.`);

          const quantity = Number(qtyVal);
          if (qtyVal === undefined || qtyVal === null || String(qtyVal).trim() === "" || isNaN(quantity) || quantity < 0) {
            errs.push(`Row ${rowNum}: Quantity must be a valid non-negative number.`);
          }

          const purchasePrice = Number(purVal);
          if (purVal === undefined || purVal === null || String(purVal).trim() === "" || isNaN(purchasePrice) || purchasePrice < 0) {
            errs.push(`Row ${rowNum}: Purchase Price must be a valid non-negative number.`);
          }

          const sellingPrice = Number(selVal);
          if (selVal === undefined || selVal === null || String(selVal).trim() === "" || isNaN(sellingPrice) || sellingPrice < 0) {
            errs.push(`Row ${rowNum}: Selling Price must be a valid non-negative number.`);
          }

          if (sku) {
            const lowSku = sku.toLowerCase();
            if (skus.has(lowSku)) {
              errs.push(`Row ${rowNum}: Duplicate SKU "${sku}" found.`);
            } else {
              skus.add(lowSku);
            }
          }

          if (errs.length < 50) {
            items.push({
              sku,
              name,
              category,
              quantity,
              unit,
              purchasePrice,
              sellingPrice
            });
          }
        }

        setPreview({
          total: items.length,
          new: items.length,
          errors: errs,
          filename: file.name
        });
        
        if (errs.length === 0) {
          setInventory(items);
        }
      } catch (err) {
        setPreview({
          total: 0,
          new: 0,
          errors: ["Failed to parse file structure. Please ensure it is a valid format."],
          filename: file.name
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className={cn("border border-dashed border-white/10 rounded-xl bg-white/1 transition-all", isLarge ? "p-6 space-y-4" : "p-4 space-y-3")}>
      <div className="flex items-center justify-between">
        <span className={cn("uppercase tracking-wider text-muted-foreground font-semibold", isLarge ? "text-xs" : "text-[10px]")}>Initial Inventory (Optional)</span>
        <div className="flex items-center gap-2 text-[10px]">
          <button type="button" onClick={downloadCSVTemplate} className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
            <Download className="w-2.5 h-2.5" /> CSV Template
          </button>
          <span className="text-white/20">|</span>
          <button type="button" onClick={downloadXLSXTemplate} className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer">
            <Download className="w-2.5 h-2.5" /> XLSX Template
          </button>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        className={cn(
          "border border-dashed rounded-lg text-center cursor-pointer transition-all",
          isLarge ? "p-8 lg:p-14" : "p-4",
          isDragging ? "border-primary bg-primary/5" : "border-white/10 bg-white/2 hover:bg-white/4"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload className={cn("mx-auto text-muted-foreground transition-all duration-300", isLarge ? "w-8 h-8 mb-2" : "w-5 h-5")} />
        <p className={cn("text-foreground font-medium", isLarge ? "text-sm" : "text-xs")}>
          {preview?.filename ? preview.filename : "Drag & drop CSV/XLSX or click to browse"}
        </p>
        <p className={cn("text-muted-foreground mt-1", isLarge ? "text-xs" : "text-[9px]")}>Formats supported: .csv, .xlsx (max size: 5MB)</p>
      </div>

      {preview && (
        <div className="text-left space-y-2 mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-primary" /> Import Preview
            </span>
            {preview.errors.length === 0 && (
              <span className="text-muted-foreground text-[10px]">
                SKUs: {preview.total}
              </span>
            )}
          </div>
          {preview.errors.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              <div className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Fix row errors to import:
              </div>
              {preview.errors.map((e: string, i: number) => (
                <div key={i} className="text-[10px] text-destructive pl-1 border-l border-destructive/30">
                  {e}
                </div>
              ))}
              <button
                type="button"
                onClick={clearFile}
                className="text-[10px] text-primary hover:underline mt-2 cursor-pointer block"
              >
                Clear file
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-2 pt-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span className="text-[11px] text-foreground font-medium">Confirm import data</span>
              </label>
              <button
                type="button"
                onClick={clearFile}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
  errors: Record<string, string>;
  inventory: any[]; setInventory: (v: any[]) => void;
  preview: any; setPreview: (v: any) => void;
  confirmed: boolean; setConfirmed: (v: boolean) => void;
}

function WarehouseStep({ 
  warehouses, onRemove, isAdding, setIsAdding, name, setName, code, setCode, 
  address, setAddress, capacity, setCapacity, email, setEmail, phone, setPhone, 
  onAdd, errors, inventory, setInventory, preview, setPreview, confirmed, setConfirmed 
}: WarehouseStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest font-semibold">Step 2</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight text-foreground font-semibold">Configure Warehouses</h2>
        <p className="text-muted-foreground mt-2 text-sm">Add one or more warehouses. You can also skip this if you're store-only.</p>
      </div>

      {warehouses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-6">
          {warehouses.map((wh, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center justify-between border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center shrink-0">
                  <Warehouse className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {wh.name} <span className="text-xs text-muted-foreground">({wh.code})</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{wh.address || "No address specified"}</div>
                  {wh.inventory && wh.inventory.length > 0 && (
                    <div className="text-[10px] text-primary font-semibold mt-1">
                      ✓ {wh.inventory.length} products loaded
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="w-full">
        {isAdding ? (
          <form onSubmit={onAdd} className="glass rounded-2xl p-6 border border-primary/20 space-y-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Details (col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-white/5 pb-2">Warehouse Details</h3>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Warehouse name <span className="text-red-500">*</span></span>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Central Hub" 
                    className={cn(
                      "mt-1 w-full h-10 rounded-lg border bg-white/2 px-3 text-sm outline-none transition-all focus:border-primary/50",
                      errors.name ? "border-destructive focus:ring-destructive/30" : "border-white/10"
                    )} 
                    required 
                  />
                  {errors.name && <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.name}</p>}
                </label>
                
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Code <span className="text-red-500">*</span></span>
                  <input 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="WH-001" 
                    className={cn(
                      "mt-1.5 w-full h-10 rounded-lg border bg-white/2 px-3 text-sm outline-none transition-all focus:border-primary/50",
                      errors.code ? "border-destructive focus:ring-destructive/30" : "border-white/10"
                    )} 
                    required 
                  />
                  {errors.code && <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.code}</p>}
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Address</span>
                  <input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="123 Storage Ln..." 
                    className="mt-1.5 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50 transition-all" 
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Capacity</span>
                    <input 
                      value={capacity} 
                      onChange={(e) => setCapacity(e.target.value)} 
                      placeholder="e.g. 50000" 
                      className="mt-1.5 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50 transition-all" 
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Phone</span>
                    <input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+12345..." 
                      className="mt-1.5 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50 transition-all" 
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contact Email</span>
                  <input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="contact@..." 
                    className="mt-1.5 w-full h-10 rounded-lg border border-white/10 bg-white/2 px-3 text-sm outline-none focus:border-primary/50 transition-all" 
                  />
                </label>
              </div>

              {/* Right Column: Dropzone (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-white/5 pb-2">Inventory Bulk Import</h3>
                <InventoryImportDropzone
                  inventory={inventory}
                  setInventory={setInventory}
                  preview={preview}
                  setPreview={setPreview}
                  confirmed={confirmed}
                  setConfirmed={setConfirmed}
                  isLarge={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => {
                  setName(""); setCode(""); setAddress(""); setCapacity(""); setEmail(""); setPhone("");
                  setInventory([]); setPreview(null); setConfirmed(false);
                  setIsAdding(false);
                }} 
                className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/3 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer">
                Add Warehouse
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full h-14 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 flex items-center justify-center gap-2 transition-colors bg-white/2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add a warehouse
          </button>
        )}
      </div>
    </>
  );
}

interface StoresStepProps {
  stores: any[];
  onRemove: (index: number) => void;
  isAddingStore: boolean;
  setIsAddingStore: (v: boolean) => void;
  newStoreName: string; setNewStoreName: (v: string) => void;
  newStoreCode: string; setNewStoreCode: (v: string) => void;
  newStoreCity: string; setNewStoreCity: (v: string) => void;
  onAdd: (e: React.FormEvent) => void;
  errors: Record<string, string>;
  inventory: any[]; setInventory: (v: any[]) => void;
  preview: any; setPreview: (v: any) => void;
  confirmed: boolean; setConfirmed: (v: boolean) => void;
}

function StoresStep({ 
  stores, onRemove, isAddingStore, setIsAddingStore, newStoreName, setNewStoreName, 
  newStoreCode, setNewStoreCode, newStoreCity, setNewStoreCity, onAdd, errors,
  inventory, setInventory, preview, setPreview, confirmed, setConfirmed 
}: StoresStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest font-semibold">Step 3</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight text-foreground font-semibold">Connect your retail stores</h2>
        <p className="text-muted-foreground mt-2 text-sm">Add as many as you'd like — you can bulk-import later via CSV or API.</p>
      </div>

      {stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-6">
          {stores.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center justify-between border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {s.name} <span className="text-xs text-muted-foreground">({s.code})</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{s.city}</div>
                  {s.inventory && s.inventory.length > 0 && (
                    <div className="text-[10px] text-primary font-semibold mt-1">
                      ✓ {s.inventory.length} products loaded
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-success/30 text-success bg-success/10 font-medium">
                  Linked
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full">
        {isAddingStore ? (
          <form onSubmit={onAdd} className="glass rounded-2xl p-6 border border-primary/20 space-y-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Details (col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-white/5 pb-2">Store Details</h3>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Store name <span className="text-red-500">*</span></span>
                  <input
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="Downtown Store"
                    className={cn(
                      "mt-1 w-full h-10 rounded-lg border bg-white/2 px-3 text-sm outline-none transition-all focus:border-primary/50",
                      errors.name ? "border-destructive focus:ring-destructive/30" : "border-white/10"
                    )}
                    required
                  />
                  {errors.name && <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.name}</p>}
                </label>
                
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Code <span className="text-red-500">*</span></span>
                  <input
                    value={newStoreCode}
                    onChange={(e) => setNewStoreCode(e.target.value)}
                    placeholder="ST-101"
                    className={cn(
                      "mt-1.5 w-full h-10 rounded-lg border bg-white/2 px-3 text-sm outline-none transition-all focus:border-primary/50",
                      errors.code ? "border-destructive focus:ring-destructive/30" : "border-white/10"
                    )}
                    required
                  />
                  {errors.code && <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.code}</p>}
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">City <span className="text-red-500">*</span></span>
                  <input
                    value={newStoreCity}
                    onChange={(e) => setNewStoreCity(e.target.value)}
                    placeholder="Mumbai"
                    className={cn(
                      "mt-1.5 w-full h-10 rounded-lg border bg-white/2 px-3 text-sm outline-none transition-all focus:border-primary/50",
                      errors.city ? "border-destructive focus:ring-destructive/30" : "border-white/10"
                    )}
                    required
                  />
                  {errors.city && <p className="text-[10px] text-destructive mt-1 font-semibold">{errors.city}</p>}
                </label>
              </div>

              {/* Right Column: Dropzone (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-white/5 pb-2">Inventory Bulk Import</h3>
                <InventoryImportDropzone
                  inventory={inventory}
                  setInventory={setInventory}
                  preview={preview}
                  setPreview={setPreview}
                  confirmed={confirmed}
                  setConfirmed={setConfirmed}
                  isLarge={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setNewStoreName(""); setNewStoreCode(""); setNewStoreCity("");
                  setInventory([]); setPreview(null); setConfirmed(false);
                  setIsAddingStore(false);
                }}
                className="h-9 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/3 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold cursor-pointer"
              >
                Add Store
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingStore(true)}
            className="w-full h-14 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white/2"
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
  customBusinessType: string;
  setCustomBusinessType: (v: string) => void;
  errors: Record<string, string>;
}

function BusinessTypeStep({ businessType, setBusinessType, customBusinessType, setCustomBusinessType, errors }: BusinessTypeStepProps) {
  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest font-semibold">Final step</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight text-foreground font-semibold">Select your business wrapper</h2>
        <p className="text-muted-foreground mt-2 text-sm">We'll tailor the interface and workflows to match your industry needs.</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {BUSINESS_TYPES.map((t) => {
          const selected = businessType === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setBusinessType(t.id)}
              className={`glass rounded-2xl p-5 text-left relative transition-all group cursor-pointer ${
                selected ? "glow-ring border-primary bg-white/10" : "hover:border-white/20"
              }`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{t.icon}</div>
              <div className="font-display text-xl text-foreground font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-1">Specialized {t.label.toLowerCase()} inventory logic and theme.</div>
              {selected && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {businessType === "other" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 space-y-2 border-t border-white/5 pt-6 text-left"
        >
          <label className="block">
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              Please specify your business type <span className="text-red-500 font-bold">*</span>
            </span>
            <input
              value={customBusinessType}
              onChange={(e) => setCustomBusinessType(e.target.value)}
              placeholder="e.g. Toys, Furniture, Cosmetics"
              className={cn(
                "mt-1.5 w-full h-11 rounded-xl border bg-white/2 px-3.5 text-sm outline-none transition-all",
                errors.customBusinessType 
                  ? "border-destructive focus:ring-1 focus:ring-destructive/30" 
                  : "border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              )}
              required
            />
            {errors.customBusinessType && (
              <p className="text-xs font-semibold text-destructive mt-1.5">{errors.customBusinessType}</p>
            )}
          </label>
        </motion.div>
      )}
    </>
  );
}

interface FeaturesStepProps {
  selectedFeatures: string[];
  setSelectedFeatures: (v: string[]) => void;
}

function FeaturesStep({ selectedFeatures, setSelectedFeatures }: FeaturesStepProps) {
  const featuresList = [
    { id: "inventory", label: "Inventory Management", desc: "Track stock counts, reorder alerts, and warehouse movements." },
    { id: "pos", label: "Point of Sale (POS)", desc: "Fast barcode scanning checkout, invoice receipts, and cash register ledger." },
    { id: "analytics", label: "Analytics & Reports", desc: "Revenue trends, slow/fast stock velocity, and regional margins." },
    { id: "ai", label: "AI Operations Brain", desc: "Demand projections, autonomous stock rebalancing recommendations." },
    { id: "stores", label: "Multi-Location Sync", desc: "Connect and synchronize warehouse hubs and store counters." },
    { id: "team", label: "Team & Roles", desc: "Enforce secure permission matrices and invite branch managers." },
    { id: "notifications", label: "Alert Notifications", desc: "Get notified on stockouts, dead stock, and system activity." },
  ];

  const handleToggle = (id: string) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  return (
    <>
      <div>
        <div className="text-xs text-primary uppercase tracking-widest font-semibold">Workspace Personalization</div>
        <h2 className="font-display text-3xl mt-2 tracking-tight text-foreground font-semibold">Choose Your Features</h2>
        <p className="text-muted-foreground mt-2 text-sm font-sans">Select the modules you want to enable in your NexaStock dashboard. You can always change this later in Settings.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {featuresList.map((f) => {
          const active = selectedFeatures.includes(f.id);
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => handleToggle(f.id)}
              className={cn(
                "glass rounded-2xl p-5 text-left relative transition-all group cursor-pointer border flex items-start gap-3.5",
                active 
                  ? "glow-ring border-primary bg-white/10" 
                  : "border-white/10 hover:border-white/20 bg-white/2"
              )}
            >
              <div className="mt-0.5 shrink-0">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                  active ? "bg-primary border-primary text-primary-foreground" : "border-white/25"
                )}>
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <div>
                <div className="font-display text-base text-foreground font-semibold leading-none">{f.label}</div>
                <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">{f.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
