import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormTextField } from "@/components/ui/FormTextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/schemas/auth";
import { motion } from "motion/react";
import { api, authState } from "@/lib/api/client";
import { toast } from "sonner";
import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · NexaStock" }] }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: search.redirect ? (search.redirect as string) : undefined,
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect = "/dashboard" } = Route.useSearch();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authState.isAuthenticated()) {
      navigate({ to: redirect });
    }
  }, [navigate, redirect]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const handleLogin = async (data: LoginInput) => {
    try {
      await api.login(data.email, data.password);
      toast.success("Signed in successfully. Welcome back!");
      navigate({ to: redirect });
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const res = await api.googleLogin(credential);
      if (res.isNewUser) {
        // Save Google details to sessionStorage and redirect to onboarding
        sessionStorage.setItem("nexastock_google_signup", JSON.stringify({
          email: res.email,
          fullName: res.fullName,
          googleId: res.googleId
        }));
        toast.info("Google verification successful. Please complete organization onboarding.");
        navigate({ to: "/onboarding" });
      } else {
        toast.success("Signed in successfully via Google!");
        navigate({ to: redirect });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed Google Sign-In");
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:flex flex-col p-10 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -top-20 -left-20 w-150 h-150 rounded-full"
          style={{background:"radial-gradient(closest-side, color-mix(in oklab, var(--electric) 28%, transparent), transparent 70%)"}}/>
        <div className="absolute bottom-0 right-0 w-125 h-125 rounded-full animate-float-slow"
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

          <Form {...form}>
            <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
              <FormTextField
                control={form.control}
                name="email"
                label="Work email"
                type="email"
                placeholder="you@company.com"
                required
              />
              
              <FormTextField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary"/> Remember me
                </label>
                <a className="text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm cursor-pointer font-medium"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground my-3">
                <div className="h-px flex-1 bg-white/10"/> or continue with <div className="h-px flex-1 bg-white/10"/>
              </div>
              
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={(res) => {
                    if (res.credential) {
                      handleGoogleSuccess(res.credential);
                    }
                  }}
                  onError={() => {
                    toast.error("Google Sign-In failed");
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="384px"
                />
              </div>
            </form>
          </Form>

          <div className="mt-6 text-sm text-muted-foreground">
            New to NexaStock? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
