import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

const statusStyle: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  low: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  out: "bg-muted text-muted-foreground border-white/10",
};

interface InventoryTableProps {
  products: Array<{
    id: string;
    sku: string;
    name: string;
    cat: string;
    stock: number;
    min: number;
    status: string;
    price: number;
    trend: number;
    purchasePrice?: number;
    unitOfMeasure?: string;
    reorderQuantity?: number;
    brand?: string;
    industry?: string;
  }>;
  balancesData?: any[];
  locationsData?: any[];
  onAdjustStock: (product: any) => void;
  onEditProduct: (product: any) => void;
}

export function InventoryTable({
  products,
  balancesData = [],
  locationsData = [],
  onAdjustStock,
  onEditProduct,
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-white/[0.02]">
          <tr>
            <th className="text-left font-medium px-5 py-3">Product</th>
            <th className="text-left font-medium px-5 py-3">Category</th>
            <th className="text-right font-medium px-5 py-3">Stock</th>
            <th className="text-right font-medium px-5 py-3">Reorder pt.</th>
            <th className="text-right font-medium px-5 py-3">Price</th>
            <th className="text-right font-medium px-5 py-3">Trend</th>
            <th className="text-center font-medium px-5 py-3">Status</th>
            <th className="text-center font-medium px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            // Find store-wise breakdown for this product
            const productBalances = balancesData.filter(
              (b: any) => b.productId === p.id && b.quantity > 0
            );

            return (
              <tr key={p.sku} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.cat}</td>
                <td className="px-5 py-3 text-right">
                  <div className="font-mono font-semibold">{p.stock.toLocaleString()}</div>
                  {/* Store-wise Breakdown */}
                  {productBalances.length > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                      {productBalances.map((pb: any) => {
                        const loc = locationsData.find((l: any) => l.id === pb.locationId);
                        return (
                          <div key={pb.locationId} className="flex justify-end gap-1 items-center">
                            <span className="text-[9px] opacity-75">{loc ? loc.name : "Location"}:</span>
                            <span className="font-mono text-foreground">{pb.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">{p.min}</td>
                <td className="px-5 py-3 text-right">${p.price}</td>
                <td className={`px-5 py-3 text-right ${p.trend >= 0 ? "text-success" : "text-destructive"}`}>
                  <span className="inline-flex items-center gap-1">
                    {p.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {p.trend > 0 ? "+" : ""}{p.trend}%
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border ${statusStyle[p.status]}`}>
                    {p.status === "out" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onAdjustStock(p)}
                      className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border border-primary/30 hover:border-primary bg-primary/10 hover:bg-primary/25 text-primary hover:text-foreground transition-all cursor-pointer"
                      title="Adjust stock (e.g. damaged goods)"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => onEditProduct(p)}
                      className="px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="Edit product details"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
