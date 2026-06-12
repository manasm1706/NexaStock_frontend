import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

const statusStyle: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  low: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  out: "bg-muted text-muted-foreground border-white/10",
};

export function InventoryTable({ products }: { products: Array<{ sku: string; name: string; cat: string; stock: number; min: number; status: string; price: number; trend: number }> }) {
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
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
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
              <td className="px-5 py-3 text-right font-mono">{p.stock.toLocaleString()}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
