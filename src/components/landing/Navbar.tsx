import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { authState } from "@/lib/api/client";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(authState.isAuthenticated());
  }, []);

  const links = [
    { label: "Platform", href: "#platform" },
    { label: "Industries", href: "#industries" },
    { label: "AI Center", href: "#ai" },
    { label: "Pricing", href: "#pricing" },
  ];
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <nav className="glass rounded-2xl px-3 pl-5 py-2.5 flex items-center gap-8 shadow-card w-full max-w-5xl">
        <Link to="/" className="flex items-center"><Logo /></Link>
        <ul className="hidden md:flex items-center gap-7 text-sm text-muted-foreground ml-2">
          {links.map(l => (
            <li key={l.label}><a href={l.href} className="hover:text-foreground transition-colors">{l.label}</a></li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          {isAuth ? (
            <Link to="/dashboard">
              <Button variant="premiumGradient" size="sm" className="cursor-pointer">Open Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground cursor-pointer">Sign in</Button>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
