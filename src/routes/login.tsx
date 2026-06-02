import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · NexaStock" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:flex flex-col p-10 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full"
          style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--electric) 28%, transparent), transparent 70%)"}}/>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-float-slow"
          style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--violet) 28%, transparent), transparent 70%)"}}/>
        <Link to="/" className="relative"><Logo size={32} /></Link>
        <div className="relative mt-auto">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
            <div className="glass rounded-3xl p-8 max-w-md shadow-premium">
              <LogoMark size={42}/>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight leading-tight">
                The operations brain<br/>for modern retail.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Sign in to orchestrate every warehouse, store and SKU — with AI in your corner.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1.5">Sign in to your NexaStock workspace.</p>

          <form className="mt-8 space-y-4" onSubmit={(e)=>e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" className="h-11 bg-white/[0.03] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="h-11 bg-white/[0.03] border-white/10" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="accent-primary"/> Remember me
              </label>
              <a className="text-primary hover:underline" href="#">Forgot password?</a>
            </div>
            <Button className="w-full h-11 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm">Sign in</Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground my-3">
              <div className="h-px flex-1 bg-white/10"/> or continue with <div className="h-px flex-1 bg-white/10"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="h-11 bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">Google</Button>
              <Button type="button" variant="outline" className="h-11 bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">Microsoft</Button>
            </div>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            New to NexaStock? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
