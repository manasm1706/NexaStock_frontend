import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, authState } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { Button } from "@/components/ui/button";
import { FormTextField } from "@/components/ui/FormTextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

const acceptInviteSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
});

type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export const Route = createFileRoute("/accept-invitation")({
  head: () => ({ meta: [{ title: "Join Workspace · NexaStock" }] }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { token?: string };
  const token = search.token || "";

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<{
    email: string;
    fullName: string;
    tenantName: string;
    roleName: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    async function fetchDetails() {
      if (!token) {
        setErrorMsg("Invitation token is missing. Please check the URL.");
        setLoadingInvite(false);
        return;
      }
      try {
        const data = await api.getInvitationDetails(token);
        setInviteDetails(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Invalid or expired invitation token.");
      } finally {
        setLoadingInvite(false);
      }
    }
    fetchDetails();
  }, [token]);

  const onSubmit = async (data: AcceptInviteInput) => {
    try {
      const result = await api.acceptInvitation({
        token,
        password: data.password
      });

      // Save token & profile details
      authState.setToken(result.token);
      authState.setProfile(result.user);
      authState.setTenantId(result.user.tenantId);

      toast.success("Account activated! Welcome to your NexaStock workspace.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation");
    }
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-mono">Verifying secure token...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <GlassCard className="max-w-md w-full p-6 text-center space-y-4">
          <LogoMark size={40} className="mx-auto text-destructive" />
          <h1 className="text-xl font-semibold text-foreground">Invitation Error</h1>
          <p className="text-sm text-muted-foreground leading-relaxed leading-6">{errorMsg}</p>
          <div className="pt-2">
            <Link to="/login" className="inline-block text-xs font-semibold text-primary hover:underline">
              Go to sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Org Branding & Welcome details */}
      <div className="relative hidden lg:flex flex-col p-10 overflow-hidden border-r border-white/5 bg-background">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-20 -left-20 w-150 h-150 rounded-full"
          style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--electric) 28%, transparent), transparent 70%)"}}/>
        <div className="absolute bottom-0 right-0 w-125 h-125 rounded-full"
          style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--violet) 28%, transparent), transparent 70%)"}}/>
        
        <Link to="/" className="relative"><Logo size={32} /></Link>
        
        <div className="relative mt-auto">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
            <GlassCard className="p-8 max-w-md shadow-premium border-white/10">
              <LogoMark size={42} />
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight leading-tight">
                You've been invited<br/>to join {inviteDetails?.tenantName}.
              </h2>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                As a newly added **{inviteDetails?.roleName}**, you will have permission-gated access to orchestrate inventory levels, track sales velocity, and utilize retail copilot analytics.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Password Setup Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Activate your account</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Setting up credentials for <strong className="text-foreground">{inviteDetails?.email}</strong>
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              
              <div>
                <label className="text-xs text-muted-foreground">Full Name</label>
                <div className="mt-1 h-10 rounded-xl border border-white/5 bg-white/2 px-3 flex items-center text-sm text-foreground/80 cursor-default select-none">
                  {inviteDetails?.fullName}
                </div>
              </div>

              <FormTextField
                control={form.control}
                name="password"
                label="Choose Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <FormTextField
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <div className="space-y-1.5 pt-2 text-[10px] text-muted-foreground leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Password must be at least 8 characters long</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full h-11 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm cursor-pointer mt-4"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Accept Invitation & Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-xs text-muted-foreground text-center">
            Already have an active account? <Link to="/login" className="text-primary hover:underline font-semibold">Sign in here</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
