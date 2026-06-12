import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { motion } from "motion/react";
import { Store, MapPin, TrendingUp, Plus, Loader2, Warehouse } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/stores")({
  head: () => ({ meta: [{ title: "Stores · NexaStock" }] }),
  component: StoresPage,
});

function StoresPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("store");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations()
  });

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !type || !city || !state || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createLocation({
        name,
        code,
        type,
        city,
        state,
        country
      });

      toast.success("Location registered successfully!");
      setOpen(false);
      // Reset form
      setName("");
      setCode("");
      setCity("");
      setState("");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create location");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Stores & Warehouses" subtitle="Loading locations...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Stores & Warehouses"
      subtitle={`${locations.length} active locations configured`}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="premiumGradient" size="md" className="h-9 px-4">
              <Plus className="w-3.5 h-3.5" /> Add location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] glass border-white/10 bg-background/95 text-foreground">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Location</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Register a new store outlet or warehouse center in your network.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocation} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Location Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Andheri Central" className="h-9 bg-white/3 border-white/10 text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="code" className="text-xs">Code</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-MUM-01" className="h-9 bg-white/3 border-white/10 text-sm" required />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <Label htmlFor="type" className="text-xs mb-1.5">Type</Label>
                  <select 
                    id="type" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="h-9 bg-white/3 border border-white/10 rounded-lg px-3 text-sm outline-none text-foreground"
                  >
                    <option value="store" className="bg-background text-foreground">Store</option>
                    <option value="warehouse" className="bg-background text-foreground">Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className="h-9 bg-white/3 border-white/10 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs">State</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="MH" className="h-9 bg-white/3 border-white/10 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country" className="text-xs">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className="h-9 bg-white/3 border-white/10 text-sm" required />
                </div>
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-white/5">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-9 text-xs">Cancel</Button>
                </DialogClose>
                <Button type="submit" variant="premiumGradient" className="h-9 text-xs" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((s: any, i: number) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden"
          >
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
                  {s.type === "warehouse" ? (
                    <Warehouse className="w-4 h-4 text-primary" />
                  ) : (
                    <Store className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {s.city || "Mumbai"} · {s.type === "warehouse" ? "Warehouse" : "Store"}
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${
                  s.healthScore >= 90 ? "text-success bg-success/10 border-success/30" :
                  s.healthScore >= 80 ? "text-warning bg-warning/10 border-warning/30" :
                  "text-destructive bg-destructive/10 border-destructive/30"
                }`}>
                  {s.healthScore || 90}%
                </span>
              </div>
              
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-white/2 py-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Code</div>
                  <div className="text-sm font-medium mt-0.5 text-foreground">{s.code}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/2 py-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Staff</div>
                  <div className="text-sm font-medium mt-0.5 text-foreground">{s.staffCount || 5}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/2 py-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Trend</div>
                  <div className="text-sm font-medium mt-0.5 text-success inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +8%
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
