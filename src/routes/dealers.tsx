import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import {
  Truck, Phone, Mail, Plus, Loader2, Pencil, Trash2,
  ShoppingCart, CheckCircle2, Copy, MessageSquare, ExternalLink,
  Building2, Hash, X, Package, ChevronDown, ChevronUp,
  AlertCircle, BadgeCheck, Search
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasModulePermission } from "@/components/app/DashboardLayout";

export const Route = createFileRoute("/dealers")({
  head: () => ({ meta: [{ title: "Dealers · NexaStock" }] }),
  beforeLoad: ({ location }) => {
    if (!authState.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    const profile = authState.getProfile();
    const role = profile?.role || "";
    const permissions = profile?.effectivePermissions || [];

    if (!hasModulePermission("dealers", role, permissions)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: DealersPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dealer {
  id: string;
  name: string;
  supplierCode: string;
  gstNumber?: string;
  status: "ACTIVE" | "PAUSED";
  productIds?: string[];
  contacts: Array<{
    id: string;
    name: string;
    phone?: string;
    email?: string;
    isPrimary: boolean;
  }>;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  currentStock: number;
  reorderLevel: number;
}

// ─── Dealer Card ──────────────────────────────────────────────────────────────

function DealerStatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border font-medium ${
      isActive
        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
        : "text-amber-400 bg-amber-400/10 border-amber-400/30"
    }`}>
      {isActive ? <BadgeCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {isActive ? "Active" : "Paused"}
    </span>
  );
}

function DealerCard({
  dealer,
  onEdit,
  onDelete,
  onPlaceOrder,
}: {
  dealer: Dealer;
  onEdit: (d: Dealer) => void;
  onDelete: (d: Dealer) => void;
  onPlaceOrder: (d: Dealer) => void;
}) {
  const primary = dealer.contacts.find(c => c.isPrimary) || dealer.contacts[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden"
    >
      <GlassCard className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
            <Truck className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{dealer.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">{dealer.supplierCode}</span>
            </div>
          </div>
          <DealerStatusBadge status={dealer.status} />
        </div>

        {/* Contact Info */}
        {primary && (
          <div className="space-y-1.5">
            {primary.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-3 h-3 text-primary/60 shrink-0" />
                <a
                  href={`tel:${primary.phone}`}
                  className="hover:text-primary transition-colors truncate"
                >
                  {primary.phone}
                </a>
              </div>
            )}
            {primary.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3 h-3 text-primary/60 shrink-0" />
                <a
                  href={`mailto:${primary.email}`}
                  className="hover:text-primary transition-colors truncate"
                >
                  {primary.email}
                </a>
              </div>
            )}
            {dealer.gstNumber && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3 text-primary/60 shrink-0" />
                <span className="font-mono truncate">{dealer.gstNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Contact Person */}
        {primary?.name && (
          <div className="border-t border-white/5 pt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
              {primary.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground">{primary.name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="premiumGradient"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onPlaceOrder(dealer)}
          >
            <ShoppingCart className="w-3 h-3" />
            Order Replenishment
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-white/10 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(dealer)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-white/10 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(dealer)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Add / Edit Dealer Modal ───────────────────────────────────────────────────

function DealerFormModal({
  open,
  dealer,
  onClose,
  onSaved,
}: {
  open: boolean;
  dealer?: Dealer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!dealer;
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts(),
    enabled: open,
  });

  const [name, setName] = useState(dealer?.name ?? "");
  const [code, setCode] = useState(dealer?.supplierCode ?? "");
  const [taxId, setTaxId] = useState(dealer?.gstNumber ?? "");
  const [contactName, setContactName] = useState(
    dealer?.contacts.find(c => c.isPrimary)?.name ?? ""
  );
  const [phone, setPhone] = useState(
    dealer?.contacts.find(c => c.isPrimary)?.phone ?? ""
  );
  const [email, setEmail] = useState(
    dealer?.contacts.find(c => c.isPrimary)?.email ?? ""
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(dealer?.productIds ?? []);
  const [productSearch, setProductSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dealer changes
  const resetAndOpen = (d?: Dealer | null) => {
    setName(d?.name ?? "");
    setCode(d?.supplierCode ?? "");
    setTaxId(d?.gstNumber ?? "");
    setContactName(d?.contacts.find(c => c.isPrimary)?.name ?? "");
    setPhone(d?.contacts.find(c => c.isPrimary)?.phone ?? "");
    setEmail(d?.contacts.find(c => c.isPrimary)?.email ?? "");
    setSelectedProductIds(d?.productIds ?? []);
    setProductSearch("");
  };

  // When dealer prop changes (opening for edit), reset form
  if (open && dealer && dealer.id !== undefined && name === "") {
    resetAndOpen(dealer);
  }

  const normalizedProducts = (products as any[]).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    supplierIds: Array.isArray(p.supplierIds) ? p.supplierIds : []
  }));

  const effectiveSelectedIds = selectedProductIds.length > 0
    ? selectedProductIds
    : (dealer?.id
      ? normalizedProducts.filter((p) => p.supplierIds.includes(dealer.id)).map((p) => p.id)
      : []);

  const filteredProducts = normalizedProducts.filter((p) =>
    !productSearch ||
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Dealer name is required");
      return;
    }
    setIsSaving(true);
    try {
      if (isEdit && dealer) {
        await api.updateSupplier(dealer.id, {
          name: name.trim(),
          code: code.trim() || undefined,
          taxId: taxId.trim() || undefined,
          contactName: contactName.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        });
        await api.setSupplierProducts(dealer.id, effectiveSelectedIds);
        toast.success("Dealer updated successfully");
      } else {
        const created = await api.createSupplier({
          name: name.trim(),
          code: code.trim() || undefined,
          taxId: taxId.trim() || undefined,
          contactName: contactName.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        });
        if (created?.id) {
          await api.setSupplierProducts(created.id, effectiveSelectedIds);
        }
        toast.success("Dealer added successfully");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save dealer");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] glass border-white/10 bg-background/95 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Dealer" : "Add New Dealer"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {isEdit ? "Update dealer details and primary contact." : "Register a supplier / dealer with contact information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Business Name */}
          <div className="space-y-1">
            <Label htmlFor="d-name" className="text-xs">Company / Dealer Name *</Label>
            <Input
              id="d-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Apex Distributors Pvt. Ltd."
              className="h-9 bg-white/3 border-white/10 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="d-code" className="text-xs">Supplier Code</Label>
              <Input
                id="d-code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="SUP-001"
                className="h-9 bg-white/3 border-white/10 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="d-gst" className="text-xs">GST / Tax ID</Label>
              <Input
                id="d-gst"
                value={taxId}
                onChange={e => setTaxId(e.target.value)}
                placeholder="29XXXXX1234Z1Z5"
                className="h-9 bg-white/3 border-white/10 text-sm font-mono"
              />
            </div>
          </div>

          {/* Contact Divider */}
          <div className="border-t border-white/5 pt-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Primary Contact</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="d-contact" className="text-xs">Contact Person</Label>
                <Input
                  id="d-contact"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Rajan Mehta"
                  className="h-9 bg-white/3 border-white/10 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="d-phone" className="text-xs">Phone Number</Label>
                  <Input
                    id="d-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-9 bg-white/3 border-white/10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="d-email" className="text-xs">Email Address</Label>
                  <Input
                    id="d-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="orders@apex.com"
                    className="h-9 bg-white/3 border-white/10 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Provided */}
          <div className="border-t border-white/5 pt-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Products Provided</p>
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU..."
                  className="h-9 pl-8 bg-white/3 border-white/10 text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/3 p-2 space-y-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-2">No products found</div>
                ) : (
                  filteredProducts.map((p) => {
                    const checked = effectiveSelectedIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs cursor-pointer border ${checked ? "border-primary/40 bg-primary/10" : "border-transparent hover:border-white/10"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p.id)}
                          className="accent-primary"
                        />
                        <span className="flex-1 truncate text-foreground">{p.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{p.sku}</span>
                      </label>
                    );
                  })
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {effectiveSelectedIds.length} product{effectiveSelectedIds.length !== 1 ? "s" : ""} selected
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-2 border-t border-white/5">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-9 text-xs" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="premiumGradient" className="h-9 text-xs" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isEdit ? "Save Changes" : "Add Dealer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteDealerModal({
  open,
  dealer,
  onClose,
  onDeleted,
}: {
  open: boolean;
  dealer?: Dealer | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!dealer) return;
    setIsDeleting(true);
    try {
      await api.deleteSupplier(dealer.id);
      toast.success(`${dealer.name} removed`);
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete dealer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[400px] glass border-white/10 bg-background/95 text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Remove Dealer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs pt-1">
            Are you sure you want to remove <strong className="text-foreground">{dealer?.name}</strong> from your dealer list?
            Existing purchase orders will not be affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" className="h-9 text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="h-9 text-xs"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Order Replenishment Modal ────────────────────────────────────────────────

function OrderModal({
  open,
  dealer,
  onClose,
}: {
  open: boolean;
  dealer?: Dealer | null;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    poNumber: string;
    grandTotal: number;
    formattedMessage: string;
    phone: string;
    email: string;
  } | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Fetch products and inventory balances
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts(),
    enabled: open,
  });

  const { data: balances = [] } = useQuery({
    queryKey: ["inventory-balances"],
    queryFn: () => api.getInventoryBalances(),
    enabled: open,
  });

  // Aggregate stock per product
  const productStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of balances as any[]) {
      map[b.productId] = (map[b.productId] || 0) + (b.qtyOnHand || 0);
    }
    return map;
  }, [balances]);

  // Build order items list
  const orderItems: OrderItem[] = useMemo(() =>
    (products as any[]).map(p => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      quantity: selectedItems[p.id] || 0,
      currentStock: productStockMap[p.id] ?? 0,
      reorderLevel: p.reorderLevel || 0,
    })),
    [products, selectedItems, productStockMap]
  );

  // Low stock items (below reorder level)
  const lowStockItems = orderItems.filter(i => i.currentStock <= i.reorderLevel);

  const filteredItems = orderItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      const next = { ...selectedItems };
      delete next[productId];
      setSelectedItems(next);
    } else {
      setSelectedItems(prev => ({ ...prev, [productId]: qty }));
    }
  };

  const selectedCount = Object.keys(selectedItems).filter(k => selectedItems[k] > 0).length;
  const totalItems = Object.values(selectedItems).reduce((s, v) => s + v, 0);

  const handleSendOrder = async () => {
    if (!dealer) return;
    const items = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) {
      toast.error("Please select at least one product and quantity");
      return;
    }

    setIsSending(true);
    try {
      const result = await api.sendSupplierOrder(dealer.id, { items, notes });
      setOrderResult(result);
      toast.success(`Purchase order ${result.poNumber} created!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!orderResult) return;
    await navigator.clipboard.writeText(orderResult.formattedMessage);
    setCopiedMsg(true);
    toast.success("Order message copied to clipboard!");
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const handleWhatsApp = () => {
    if (!orderResult) return;
    const phone = orderResult.phone.replace(/\D/g, "");
    const text = encodeURIComponent(orderResult.formattedMessage);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const handleReset = () => {
    setSelectedItems({});
    setNotes("");
    setOrderResult(null);
    setCopiedMsg(false);
    setSearchTerm("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] glass border-white/10 bg-background/95 text-foreground flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {orderResult ? "Order Placed!" : `Order to ${dealer?.name}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {orderResult
              ? `Purchase order ${orderResult.poNumber} has been created. Share the order with your dealer.`
              : "Select products and quantities to place a replenishment order."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Order Success State ── */}
        {orderResult ? (
          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Order #{orderResult.poNumber} created
            </div>

            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Order Message</p>
              <pre className="whitespace-pre-wrap text-xs text-foreground font-mono leading-relaxed max-h-48 overflow-y-auto">
                {orderResult.formattedMessage}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/3 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Grand Total</p>
                <p className="text-lg font-bold text-foreground mt-0.5">
                  ₹{orderResult.grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/3 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">PO Number</p>
                <p className="text-lg font-bold text-foreground mt-0.5 font-mono">{orderResult.poNumber}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="premiumGradient" className="h-10 text-sm w-full" onClick={handleWhatsApp} disabled={!orderResult.phone}>
                <MessageSquare className="w-4 h-4" />
                Open WhatsApp Chat
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="h-10 text-sm w-full border-white/10"
                onClick={handleCopyMessage}
              >
                {copiedMsg ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedMsg ? "Copied!" : "Copy Order Message"}
              </Button>
              {orderResult.email && (
                <Button
                  variant="outline"
                  className="h-10 text-sm w-full border-white/10"
                  asChild
                >
                  <a href={`mailto:${orderResult.email}?subject=Purchase Order ${orderResult.poNumber}&body=${encodeURIComponent(orderResult.formattedMessage)}`}>
                    <Mail className="w-4 h-4" />
                    Send via Email
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
              )}
            </div>

            <Button variant="ghost" className="w-full h-9 text-xs text-muted-foreground" onClick={handleReset}>
              Create Another Order
            </Button>
          </div>
        ) : (
          /* ── Order Builder ── */
          <div className="flex-1 flex flex-col gap-3 overflow-hidden py-2">
            {/* Low Stock Alert Banner */}
            {lowStockItems.length > 0 && (
              <div className="shrink-0 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-amber-300">
                  {lowStockItems.length} items are below reorder level and suggested for replenishment
                </span>
              </div>
            )}

            {/* Search */}
            <div className="shrink-0 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="h-9 pl-8 bg-white/3 border-white/10 text-sm"
              />
            </div>

            {/* Product Selection */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.reorderLevel;
                const qty = selectedItems[item.productId] || 0;
                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-xl border p-3 transition-colors ${
                      qty > 0
                        ? "border-primary/40 bg-primary/5"
                        : isLow
                        ? "border-amber-400/20 bg-amber-400/3"
                        : "border-white/8 bg-white/2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.productName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{item.sku}</span>
                          {isLow && (
                            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 rounded">
                              Low Stock: {item.currentStock}
                            </span>
                          )}
                          {!isLow && (
                            <span className="text-[10px] text-muted-foreground">
                              In stock: {item.currentStock}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, qty - 1)}
                          className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={qty || ""}
                          onChange={e => setQty(item.productId, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-14 h-7 rounded-lg border border-white/10 bg-white/3 text-center text-xs font-medium text-foreground outline-none focus:border-primary/50"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(item.productId, qty + 1)}
                          className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Notes */}
            <div className="shrink-0 space-y-1">
              <Label className="text-xs">Order Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Delivery instructions, urgency, special requirements..."
                className="w-full h-16 rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between border-t border-white/5 pt-3 gap-3">
              <div className="text-xs text-muted-foreground">
                {selectedCount > 0
                  ? `${selectedCount} products · ${totalItems} total units`
                  : "No products selected"}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-9 text-xs border-white/10" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="premiumGradient"
                  className="h-9 text-xs"
                  onClick={handleSendOrder}
                  disabled={isSending || selectedCount === 0}
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function DealersPage() {
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<Dealer | null>(null);
  const [deleteDealer, setDeleteDealer] = useState<Dealer | null>(null);
  const [orderDealer, setOrderDealer] = useState<Dealer | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ACTIVE" | "PAUSED">("all");

  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.getSuppliers(),
  });

  const filteredDealers = useMemo(() => {
    return (dealers as Dealer[]).filter(d => {
      const contacts = Array.isArray(d.contacts) ? d.contacts : [];
      const matchSearch =
        !filterSearch ||
        d.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        d.supplierCode?.toLowerCase().includes(filterSearch.toLowerCase()) ||
        contacts.some(c => c.phone?.includes(filterSearch) || c.email?.toLowerCase().includes(filterSearch.toLowerCase()));
      const matchStatus = filterStatus === "all" || d.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [dealers, filterSearch, filterStatus]);

  const activeCount = (dealers as Dealer[]).filter(d => d.status === "ACTIVE").length;

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dealers" subtitle="Loading suppliers...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dealers"
      subtitle={`${activeCount} active supplier${activeCount !== 1 ? "s" : ""} · ${(dealers as Dealer[]).length} total`}
      actions={
        <Button
          variant="premiumGradient"
          size="md"
          className="h-9 px-4"
          onClick={() => { setEditDealer(null); setAddOpen(true); }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Dealer
        </Button>
      }
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Dealers", value: (dealers as Dealer[]).length, color: "text-foreground" },
          { label: "Active", value: activeCount, color: "text-emerald-400" },
          { label: "Paused", value: (dealers as Dealer[]).filter(d => d.status === "PAUSED").length, color: "text-amber-400" },
          { label: "With Phone", value: (dealers as Dealer[]).filter(d => (Array.isArray(d.contacts) ? d.contacts : []).some(c => c.phone)).length, color: "text-blue-400" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Search dealers, phone, email..."
            className="h-9 pl-8 bg-white/3 border-white/10 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/3 p-1">
          {(["all", "ACTIVE", "PAUSED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredDealers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filterSearch || filterStatus !== "all" ? "No dealers match your filters" : "No dealers yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {filterSearch || filterStatus !== "all"
              ? "Try adjusting your search or filter settings."
              : "Add your first supplier or dealer to start managing orders and replenishments."}
          </p>
          {!filterSearch && filterStatus === "all" && (
            <Button variant="premiumGradient" onClick={() => { setEditDealer(null); setAddOpen(true); }}>
              <Plus className="w-4 h-4" />
              Add Your First Dealer
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDealers.map(dealer => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                onEdit={d => { setEditDealer(d); setAddOpen(true); }}
                onDelete={d => setDeleteDealer(d)}
                onPlaceOrder={d => setOrderDealer(d)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <DealerFormModal
        open={addOpen}
        dealer={editDealer}
        onClose={() => { setAddOpen(false); setEditDealer(null); }}
        onSaved={handleSaved}
      />

      <DeleteDealerModal
        open={!!deleteDealer}
        dealer={deleteDealer}
        onClose={() => setDeleteDealer(null)}
        onDeleted={handleSaved}
      />

      <OrderModal
        open={!!orderDealer}
        dealer={orderDealer}
        onClose={() => setOrderDealer(null)}
      />
    </DashboardLayout>
  );
}
