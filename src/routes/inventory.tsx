import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { GlassCard, MetricCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { motion } from "motion/react";
import { Plus, Filter, Download, Loader2, Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import * as XLSX from "xlsx";
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

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory · NexaStock" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedCat, setSelectedCat] = useState("All");
  const [open, setOpen] = useState(false);

  // Form states for adding product
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pharmacy");
  const [unitOfMeasure, setUnitOfMeasure] = useState("box");
  const [purchasePrice, setPurchasePrice] = useState("35");
  const [sellingPrice, setSellingPrice] = useState("48");
  const [reorderLevel, setReorderLevel] = useState("40");
  const [reorderQuantity, setReorderQuantity] = useState("200");
  const [industry, setIndustry] = useState("pharmacy");
  const [brand, setBrand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Export states
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"all" | "filtered">("all");
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");

  // Import states
  const [importOpen, setImportOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [rowErrors, setRowErrors] = useState<Array<{ row: number; errors: string[] }>>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0, newSkus: 0, existingSkus: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);

  // Fetch products and inventory balances
  const { data: productsData = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.getProducts()
  });

  const { data: balancesData = [], isLoading: loadingBalances } = useQuery({
    queryKey: ["inventory-balances"],
    queryFn: () => api.getInventoryBalances()
  });

  const { data: locationsData = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations()
  });

  const isLoading = loadingProducts || loadingBalances;

  // Export Handler
  const handleExport = () => {
    const targetProducts = exportScope === "all" 
      ? productsData 
      : productsData.filter((p: any) => selectedCat === "All" || p.category === selectedCat);
    
    const exportData = targetProducts.map((prod: any) => {
      const stock = balancesData
        .filter((bal: any) => bal.productId === prod.id)
        .reduce((sum: number, bal: any) => sum + bal.quantity, 0);

      const reserved = balancesData
        .filter((bal: any) => bal.productId === prod.id)
        .reduce((sum: number, bal: any) => sum + (bal.qtyReserved || 0), 0);

      return {
        "SKU": prod.sku,
        "Product Name": prod.name,
        "Category": prod.category || "Uncategorized",
        "Brand": prod.brand || "",
        "Quantity On Hand": stock,
        "Reserved Quantity": reserved,
        "Reorder Level": prod.reorderLevel,
        "Reorder Quantity": prod.reorderQuantity || 0,
        "Purchase Price": prod.purchasePrice || 0,
        "Selling Price": prod.sellingPrice || 0,
        "Last Updated": prod.updatedAt ? new Date(prod.updatedAt).toLocaleDateString() : ""
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    if (exportFormat === "csv") {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      XLSX.writeFile(workbook, `inventory-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
    toast.success("Inventory exported successfully!");
    setExportOpen(false);
  };

  // Download template helper
  const downloadTemplate = (format: "csv" | "xlsx") => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["SKU", "Product Name", "Category", "Quantity", "Unit", "Purchase Price", "Selling Price", "Reorder Level"],
      ["MED-PARA-500", "Paracetamol 500mg", "Pharmacy", 100, "box", 35, 48, 40],
      ["APP-DENIM-SHIRT", "Denim Shirt", "Apparel", 50, "pcs", 650, 1099, 10]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    if (format === "csv") {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "inventory-template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      XLSX.writeFile(wb, "inventory-template.xlsx");
    }
  };

  // Parse & Validate Sheet Content
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
        const parsed: any[] = [];
        const errors: Array<{ row: number; errors: string[] }> = [];
        let newCount = 0;
        let existingCount = 0;

        const existingSkuMap = new Set(productsData.map((p: any) => p.sku.toLowerCase().trim()));

        rows.forEach((row, idx) => {
          const rowNum = idx + 2;
          const rowErrors: string[] = [];

          const getValue = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => keys.includes(normalizeKey(k)));
            return foundKey ? row[foundKey] : undefined;
          };

          const skuRaw = getValue(["sku"]);
          const nameRaw = getValue(["name", "productname"]);
          const categoryRaw = getValue(["category", "productcategory"]);
          const quantityRaw = getValue(["quantity", "qty", "quantityonhand", "stock"]);
          const unitRaw = getValue(["unit", "uom", "unitofmeasure"]);
          const purchasePriceRaw = getValue(["purchaseprice", "purchase", "cost"]);
          const sellingPriceRaw = getValue(["sellingprice", "price"]);
          const reorderLevelRaw = getValue(["reorderlevel", "reorder", "threshold"]);

          const sku = skuRaw ? String(skuRaw).trim() : "";
          if (!sku) rowErrors.push("SKU is required");

          const name = nameRaw ? String(nameRaw).trim() : "";
          if (!name) rowErrors.push("Product Name is required");

          const categoryName = categoryRaw ? String(categoryRaw).trim() : "";
          if (!categoryName) rowErrors.push("Category is required");

          const quantity = quantityRaw !== undefined ? Number(quantityRaw) : 0;
          if (quantityRaw === undefined) {
            rowErrors.push("Quantity is required");
          } else if (isNaN(quantity) || quantity < 0) {
            rowErrors.push("Quantity must be a non-negative number");
          }

          const unit = unitRaw ? String(unitRaw).trim() : "box";

          const purchasePrice = purchasePriceRaw !== undefined ? Number(purchasePriceRaw) : 0;
          if (purchasePriceRaw !== undefined && (isNaN(purchasePrice) || purchasePrice < 0)) {
            rowErrors.push("Purchase Price must be a non-negative number");
          }

          const sellingPrice = sellingPriceRaw !== undefined ? Number(sellingPriceRaw) : 0;
          if (sellingPriceRaw !== undefined && (isNaN(sellingPrice) || sellingPrice < 0)) {
            rowErrors.push("Selling Price must be a non-negative number");
          }

          const reorderLevel = reorderLevelRaw !== undefined ? Number(reorderLevelRaw) : 0;
          if (reorderLevelRaw !== undefined && (isNaN(reorderLevel) || reorderLevel < 0)) {
            rowErrors.push("Reorder Level must be a non-negative number");
          }

          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, errors: rowErrors });
          } else {
            parsed.push({
              sku,
              name,
              category: categoryName,
              quantity,
              unit,
              purchasePrice,
              sellingPrice,
              reorderLevel
            });

            if (existingSkuMap.has(sku.toLowerCase())) {
              existingCount++;
            } else {
              newCount++;
            }
          }
        });

        setParsedRows(parsed);
        setRowErrors(errors);
        setStats({
          total: rows.length,
          valid: parsed.length,
          invalid: errors.length,
          newSkus: newCount,
          existingSkus: existingCount
        });
      } catch (err: any) {
        toast.error("Failed to read file: " + err.message);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Submit parsed data
  const handleImportSubmit = async () => {
    if (!selectedLocation) {
      toast.error("Please select a target Location");
      return;
    }
    if (parsedRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    if (!confirmImport) {
      toast.error("Please confirm you understand the import conditions");
      return;
    }

    setIsImporting(true);
    try {
      await api.importInventory({
        locationId: selectedLocation,
        fileType: file?.name.endsWith(".csv") ? "csv" : "xlsx",
        items: parsedRows
      });

      toast.success(`Successfully imported ${parsedRows.length} items!`);
      
      setFile(null);
      setParsedRows([]);
      setRowErrors([]);
      setConfirmImport(false);
      setImportOpen(false);

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to import inventory");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !category || !unitOfMeasure || !purchasePrice || !sellingPrice || !reorderLevel || !reorderQuantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProduct({
        sku,
        name,
        category,
        unitOfMeasure,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        reorderLevel: Number(reorderLevel),
        reorderQuantity: Number(reorderQuantity),
        industry,
        brand: brand || undefined,
        taxRate: 12
      });

      toast.success("Product created successfully!");
      setOpen(false);
      // Reset form
      setSku("");
      setName("");
      setBrand("");
      
      // Invalidate queries to reload data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Inventory" subtitle="Loading catalog...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Map database products to the table requirements
  const mappedProducts = productsData.map((prod: any) => {
    const stock = balancesData
      .filter((bal: any) => bal.productId === prod.id)
      .reduce((sum: number, bal: any) => sum + bal.quantity, 0);

    let status = "healthy";
    if (stock === 0) {
      status = "out";
    } else if (stock <= prod.reorderLevel * 0.5) {
      status = "critical";
    } else if (stock <= prod.reorderLevel) {
      status = "low";
    }

    return {
      sku: prod.sku,
      name: prod.name,
      cat: prod.category,
      stock,
      min: prod.reorderLevel,
      price: prod.sellingPrice,
      status,
      trend: prod.metadata?.trend !== undefined ? Number(prod.metadata.trend) : 10
    };
  });

  // Calculate dynamic metrics
  const totalSKUs = productsData.length;
  
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  productsData.forEach((prod: any) => {
    const stock = balancesData
      .filter((bal: any) => bal.productId === prod.id)
      .reduce((sum: number, bal: any) => sum + bal.quantity, 0);

    totalValue += (prod.purchasePrice || 100) * stock;
    
    if (stock === 0) {
      outOfStockCount++;
    } else if (stock <= prod.reorderLevel) {
      lowStockCount++;
    }
  });

  const uniqueCats = ["All", ...Array.from(new Set(productsData.map((p: any) => p.category)))];

  const filteredProducts = mappedProducts.filter(
    (p: any) => selectedCat === "All" || p.cat === selectedCat
  );

  return (
    <DashboardLayout
      title="Inventory"
      subtitle={`Across ${totalSKUs} unique SKUs in network`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" className="h-9 px-3">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="md" className="h-9 px-3">
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] glass border-white/10 bg-background/95 text-foreground animate-in fade-in-50 duration-200">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Export Inventory</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Generate a spreadsheet download of the current product directory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-xs">Export Scope</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportScope("all")}
                      className={`h-9 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        exportScope === "all"
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/3 hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportScope("filtered")}
                      className={`h-9 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        exportScope === "filtered"
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/3 hover:bg-white/5 text-muted-foreground"
                      }`}
                      disabled={selectedCat === "All"}
                    >
                      Filtered ({selectedCat})
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">File Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportFormat("xlsx")}
                      className={`h-9 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        exportFormat === "xlsx"
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/3 hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat("csv")}
                      className={`h-9 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        exportFormat === "csv"
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/3 hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      CSV (.csv)
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-2 pt-2 border-t border-white/5">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-9 text-xs">Cancel</Button>
                </DialogClose>
                <Button onClick={handleExport} variant="premiumGradient" className="h-9 text-xs">
                  Generate Export
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={importOpen} onOpenChange={(openVal) => {
            setImportOpen(openVal);
            if (!openVal) {
              setFile(null);
              setParsedRows([]);
              setRowErrors([]);
              setConfirmImport(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="md" className="h-9 px-3">
                <Upload className="w-3.5 h-3.5" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] glass border-white/10 bg-background/95 text-foreground max-h-[90vh] overflow-y-auto animate-in fade-in-50 duration-200">
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" /> Import Inventory
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Upload CSV or Excel spreadsheets to bulk add products and stock values.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Target Warehouse/Store</Label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="" className="bg-background">Select Target Location...</option>
                      {locationsData.map((loc: any) => (
                        <option key={loc.id} value={loc.id} className="bg-background">
                          {loc.name} ({loc.type || loc.locationType || "Location"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Template Sheets</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-9"
                        onClick={() => downloadTemplate("xlsx")}
                      >
                        Excel Template
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-9"
                        onClick={() => downloadTemplate("csv")}
                      >
                        CSV Template
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Spreadsheet File</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-primary/45 rounded-lg cursor-pointer bg-white/3 hover:bg-white/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-foreground font-medium">
                        {file ? file.name : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        CSV or Excel formats up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {file && (
                  <div className="space-y-3 rounded-lg border border-white/10 bg-white/2 p-4">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Parse Preview
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded border border-white/5 bg-white/1 p-2">
                        <div className="text-lg font-bold text-foreground">{stats.total}</div>
                        <div className="text-[10px] text-muted-foreground">Total Rows</div>
                      </div>
                      <div className="rounded border border-white/5 bg-green-500/5 p-2">
                        <div className="text-lg font-bold text-green-400">{stats.valid}</div>
                        <div className="text-[10px] text-green-400">Valid Rows</div>
                      </div>
                      <div className="rounded border border-white/5 bg-destructive/5 p-2">
                        <div className="text-lg font-bold text-destructive">{stats.invalid}</div>
                        <div className="text-[10px] text-destructive">Invalid Rows</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-muted-foreground pt-1 border-t border-white/5">
                      <div>Estimated New Catalog SKUs: <span className="font-semibold text-foreground">{stats.newSkus}</span></div>
                      <div>Matching / Incremented SKUs: <span className="font-semibold text-foreground">{stats.existingSkus}</span></div>
                    </div>

                    {rowErrors.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Validation Failures ({rowErrors.length})
                        </div>
                        <div className="max-h-24 overflow-y-auto text-[10px] font-mono border border-destructive/10 bg-destructive/5 text-destructive/90 rounded p-2 space-y-1">
                          {rowErrors.map((err, i) => (
                            <div key={i}>
                              Row {err.row}: {err.errors.join(", ")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stats.valid > 0 && rowErrors.length === 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> All rows parsed and validated successfully!
                      </div>
                    )}
                  </div>
                )}

                {parsedRows.length > 0 && (
                  <div className="flex items-start gap-2.5 pt-2 border-t border-white/5">
                    <input
                      id="confirmImport"
                      type="checkbox"
                      checked={confirmImport}
                      onChange={(e) => setConfirmImport(e.target.checked)}
                      className="mt-0.5 rounded border-white/10 bg-white/5 text-primary focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="confirmImport" className="text-[11px] text-muted-foreground leading-normal cursor-pointer select-none">
                      I understand that matching SKUs will have their catalog pricing, unit, and reorder levels updated in the directory, and their stock balances incremented for location.
                    </label>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4 pt-2 border-t border-white/5">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-9 text-xs">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleImportSubmit}
                  variant="premiumGradient"
                  className="h-9 text-xs"
                  disabled={isImporting || parsedRows.length === 0 || !selectedLocation || !confirmImport}
                >
                  {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Import ${parsedRows.length} items`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="premiumGradient" size="md" className="h-9 px-4">
                <Plus className="w-3.5 h-3.5" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass border-white/10 bg-background/95 text-foreground max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Create a new SKU record in the central inventory directory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sku" className="text-xs">SKU Code</Label>
                    <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MED-PARA-500" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Product Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Paracetamol 500mg" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-xs">Category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Pharmacy" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="uom" className="text-xs">Unit of Measure</Label>
                    <Input id="uom" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} placeholder="box" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="purchase" className="text-xs">Purchase Price ($)</Label>
                    <Input id="purchase" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="35" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="selling" className="text-xs">Selling Price ($)</Label>
                    <Input id="selling" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="48" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reorderPt" className="text-xs">Reorder Threshold</Label>
                    <Input id="reorderPt" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="40" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reorderQty" className="text-xs">Reorder Quantity</Label>
                    <Input id="reorderQty" type="number" value={reorderQuantity} onChange={(e) => setReorderQuantity(e.target.value)} placeholder="200" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="industry" className="text-xs">Industry</Label>
                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="pharmacy" className="h-9 bg-white/3 border-white/10 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="brand" className="text-xs">Brand (Optional)</Label>
                    <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="GSK" className="h-9 bg-white/3 border-white/10 text-sm" />
                  </div>
                </div>

                <DialogFooter className="mt-4 pt-2 border-t border-white/5">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="h-9 text-xs">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="premiumGradient" className="h-9 text-xs" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { l: "Total SKUs", v: totalSKUs.toLocaleString(), d: "Active in directory" },
          { l: "Inventory value", v: `$${(totalValue / 1000).toFixed(1)}k`, d: "Cost-basis value" },
          { l: "Low stock", v: lowStockCount.toString(), d: "Threshold breached", warn: true },
          { l: "Out of stock", v: outOfStockCount.toString(), d: "Action required", danger: true },
        ].map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.45 }}
          >
            <MetricCard label={k.l} value={k.v} delta={k.d} className={k.danger ? "border-destructive/30" : k.warn ? "border-warning/30" : undefined} />
          </motion.div>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5">
          <div>
            <SectionTitle>Product catalog</SectionTitle>
            <div className="text-xs text-muted-foreground">Real-time stock across the network</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {uniqueCats.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedCat(t)}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  selectedCat === t ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <InventoryTable products={filteredProducts} />
      </GlassCard>
    </DashboardLayout>
  );
}
