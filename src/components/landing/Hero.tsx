import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, TrendingUp, Package, Boxes, Brain } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { authState } from "@/lib/api/client";
import { useEffect, useState } from "react";

function FloatingCard({
  delay = 0, className = "", children,
}: { delay?: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-2xl p-4 shadow-premium ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(authState.isAuthenticated());
  }, []);

  return (
    <section className="relative pt-36 pb-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      {/* Ambient blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--electric) 30%, transparent), transparent 70%)" }} />
      <div className="absolute top-40 right-0 w-[600px] h-[600px] rounded-full pointer-events-none animate-float-slow"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--violet) 28%, transparent), transparent 70%)" }} />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Now with AI redistribution and demand forecasting</span>
          <span className="text-foreground/60">·</span>
          <span className="text-foreground/80">v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(2.5rem,6vw,5.25rem)] leading-[1.02] tracking-tight font-semibold"
        >
          <span className="text-gradient">AI-powered inventory</span>
          <br />
          <span className="text-foreground">for modern retail operations.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="mt-7 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          NexaStock is the warehouse-first intelligence platform that orchestrates
          stock, sales, and forecasts across every store — in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-9 flex items-center justify-center gap-3"
        >
          {isAuth ? (
            <Link to="/dashboard">
              <Button size="lg" className="h-12 px-8 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow hover:brightness-110 cursor-pointer">
                Open Dashboard <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="h-12 px-6 bg-gradient-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow hover:brightness-110 cursor-pointer">
                  Start Free Trial <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="h-12 px-6 glass hover:bg-white/5 cursor-pointer">
                Book a demo
              </Button>
            </>
          )}
        </motion.div>

        {/* Dashboard preview composition */}
        <div className="relative mt-20 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass rounded-3xl p-3 shadow-premium glow-ring"
          >
            <div className="rounded-2xl bg-[oklch(0.13_0.012_260)] border border-white/5 overflow-hidden">
              {/* fake topbar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="ml-4 text-xs text-muted-foreground">nexastock.app / dashboard</div>
              </div>
              {/* fake dashboard */}
              <div className="grid grid-cols-12 gap-3 p-4">
                <div className="col-span-3 space-y-3">
                  {["Overview","Inventory","AI Center","Stores","Analytics","Settings"].map((l, i) => (
                    <div key={l} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i===2?'bg-white/5 text-foreground':'text-muted-foreground'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />{l}
                    </div>
                  ))}
                </div>
                <div className="col-span-9 grid grid-cols-3 gap-3">
                  {[
                    {l:"Revenue",v:"$1.42M",d:"+12.4%",c:"text-success"},
                    {l:"Active Stores",v:"148",d:"+6",c:"text-success"},
                    {l:"AI Confidence",v:"94%",d:"high",c:"text-primary"},
                  ].map(k=>(
                    <div key={k.l} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-left">
                      <div className="text-[11px] text-muted-foreground">{k.l}</div>
                      <div className="text-2xl font-display font-semibold mt-1">{k.v}</div>
                      <div className={`text-[11px] mt-1 ${k.c}`}>{k.d}</div>
                    </div>
                  ))}
                  <div className="col-span-3 rounded-xl bg-white/[0.03] border border-white/5 p-4 h-44 relative overflow-hidden">
                    <div className="text-[11px] text-muted-foreground mb-2">Demand Forecast · 30d</div>
                    <svg viewBox="0 0 400 100" className="w-full h-28">
                      <defs>
                        <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="oklch(0.66 0.22 258)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,80 C40,60 80,70 120,55 C160,40 200,50 240,35 C280,20 320,30 360,18 L400,15 L400,100 L0,100 Z" fill="url(#hf)" />
                      <path d="M0,80 C40,60 80,70 120,55 C160,40 200,50 240,35 C280,20 320,30 360,18 L400,15" stroke="oklch(0.78 0.18 258)" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* floating accent cards */}
          <FloatingCard delay={0.9} className="absolute -left-6 md:-left-16 top-24 w-56 hidden md:block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Brain className="w-3.5 h-3.5 text-primary" /> AI Recommendation</div>
            <div className="text-sm mt-2 text-foreground">Move <b>50 units</b> of <i>Atorva-20</i> from Store B → Store C.</div>
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent" /></div>
          </FloatingCard>

          <FloatingCard delay={1.1} className="absolute -right-4 md:-right-14 top-44 w-52 hidden md:block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-success" /> Sales spike</div>
            <div className="text-sm mt-2 text-foreground">Mumbai region <b>+38%</b> this week.</div>
          </FloatingCard>

          <FloatingCard delay={1.3} className="absolute -right-2 md:right-12 -bottom-8 w-60 hidden md:block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="w-3.5 h-3.5 text-warning" /> Low stock</div>
            <div className="text-sm mt-2 text-foreground">12 SKUs will run out in <b>4 days</b>.</div>
          </FloatingCard>

          <FloatingCard delay={1.5} className="absolute -left-2 md:left-8 -bottom-10 w-52 hidden md:block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Boxes className="w-3.5 h-3.5 text-accent" /> Warehouse</div>
            <div className="text-sm mt-2 text-foreground">3 transfers pending dispatch.</div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}
