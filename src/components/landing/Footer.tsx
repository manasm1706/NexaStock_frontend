import { Logo } from "@/components/brand/Logo";
import { Link } from "@tanstack/react-router";

export function Footer() {
  const columns = [
    {
      h: "Platform",
      items: [
        { label: "Inventory", href: "/platform/inventory" },
        { label: "AI Center", href: "/platform/ai-center" },
        { label: "POS", href: "/platform/pos" },
        { label: "Analytics", href: "/platform/analytics" },
        { label: "Roles", href: "/platform/roles" },
      ]
    },
    {
      h: "Company",
      items: [
        { label: "About", href: "/about" },
        { label: "Customers", href: "/customers" },
        { label: "Pricing", href: "/pricing" },
        { label: "Security", href: "/security" },
        { label: "Contact", href: "/contact" },
      ]
    }
  ];

  return (
    <footer className="border-t border-white/5 mt-10">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo size={32} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm font-sans">
            The AI-powered multi-store inventory & retail intelligence platform.
            Designed for the next decade of operations.
          </p>
        </div>
        {columns.map(col => (
          <div key={col.h}>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{col.h}</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.items.map(i => (
                <li key={i.label}>
                  <Link className="text-foreground/80 hover:text-foreground transition-colors" to={i.href}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground font-sans">
        © {new Date().getFullYear()} NexaStock Inc. · Crafted for modern retail.
      </div>
    </footer>
  );
}
