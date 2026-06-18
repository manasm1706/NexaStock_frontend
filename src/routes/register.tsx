import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormTextField } from "@/components/ui/FormTextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/schemas/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account · NexaStock" }] }),
  component: RegisterPage,
});

function getPasswordStrength(password: string) {
  if (!password) return { label: "", score: 0, color: "bg-transparent", text: "text-transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 3) {
    return { label: "Weak", score, color: "bg-red-500", text: "text-red-500" };
  } else if (score < 5) {
    return { label: "Medium", score, color: "bg-amber-500", text: "text-amber-500" };
  } else {
    return { label: "Strong", score, color: "bg-green-500", text: "text-green-500" };
  }
}

function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password", "");
  const strength = getPasswordStrength(password);
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: RegisterInput) => {
    try {
      sessionStorage.setItem("nexastock_signup_fullName", data.fullName);
      sessionStorage.setItem("nexastock_signup_email", data.email);
      sessionStorage.setItem("nexastock_signup_company", data.company);
      sessionStorage.setItem("nexastock_signup_password", data.password);

      toast.success("Workspace configuration details saved!");
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 grid-bg pointer-events-none -z-10" />
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-premium">
        <Link to="/"><Logo /></Link>
        <h1 className="font-display text-2xl font-semibold mt-6 tracking-tight">Start your free trial</h1>
        <p className="text-sm text-muted-foreground">14 days free. No credit card required.</p>
        
        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormTextField
              control={form.control}
              name="fullName"
              label="Full name"
              placeholder="Jane Doe"
              required
            />
            
            <FormTextField
              control={form.control}
              name="email"
              label="Work email"
              type="email"
              placeholder="jane@company.com"
              required
            />
            
            <FormTextField
              control={form.control}
              name="company"
              label="Company"
              placeholder="Acme Retail"
              required
            />
            
            <div className="space-y-1.5">
              <FormTextField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                required
              />
              {password && (
                <div className="space-y-1.5 mt-1" aria-live="polite">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className={cn("font-semibold", strength.text)}>{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", strength.color)}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <FormTextField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              required
            />

            <Button 
              type="submit" 
              className="w-full h-11 bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] shadow-glow-sm cursor-pointer mt-2"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Creating workspace..." : "Create workspace"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
