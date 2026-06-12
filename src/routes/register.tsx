import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · NexaStock" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-premium">
        <Link to="/"><Logo /></Link>
        <h1 className="font-display text-2xl font-semibold mt-6 tracking-tight">Start your free trial</h1>
        <p className="text-sm text-muted-foreground">14 days free. No credit card required.</p>
        <form className="mt-6 space-y-3" onSubmit={(e)=>e.preventDefault()}>
          <div className="space-y-1.5"><Label>Full name</Label><Input className="h-11 bg-white/3 border-white/10" placeholder="Jane Doe"/></div>
          <div className="space-y-1.5"><Label>Work email</Label><Input type="email" className="h-11 bg-white/3 border-white/10" placeholder="jane@company.com"/></div>
          <div className="space-y-1.5"><Label>Company</Label><Input className="h-11 bg-white/3 border-white/10" placeholder="Acme Retail"/></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" className="h-11 bg-white/3 border-white/10" placeholder="••••••••"/></div>
          <Link to="/onboarding"><Button className="w-full h-11 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm">Create workspace</Button></Link>
        </form>
        <div className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
