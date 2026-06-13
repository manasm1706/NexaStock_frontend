import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · NexaStock" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !company || !password) {
      toast.error("Please fill in all details to start onboarding");
      return;
    }

    sessionStorage.setItem("nexastock_signup_fullName", fullName);
    sessionStorage.setItem("nexastock_signup_email", email);
    sessionStorage.setItem("nexastock_signup_company", company);
    sessionStorage.setItem("nexastock_signup_password", password);

    navigate({ to: "/onboarding" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-premium">
        <Link to="/"><Logo /></Link>
        <h1 className="font-display text-2xl font-semibold mt-6 tracking-tight">Start your free trial</h1>
        <p className="text-sm text-muted-foreground">14 days free. No credit card required.</p>
        <form className="mt-6 space-y-4" onSubmit={handleRegisterNext}>
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              className="h-11 bg-white/3 border-white/10"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              className="h-11 bg-white/3 border-white/10"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              className="h-11 bg-white/3 border-white/10"
              placeholder="Acme Retail"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="h-11 bg-white/3 border-white/10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm cursor-pointer">
            Create workspace
          </Button>
        </form>
        <div className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
