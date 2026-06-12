import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow-sm hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground shadow-glow-sm hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-white/5 hover:text-foreground text-muted-foreground",
        outline: "border border-white/10 bg-white/3 hover:bg-white/5 text-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success: "bg-success/15 text-success border border-success/30 hover:bg-success/20",
        premiumGradient: "bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm hover:brightness-110",
        ai: "bg-linear-to-b from-primary to-accent text-primary-foreground shadow-glow-sm hover:brightness-110",
        pos: "bg-linear-to-b from-primary to-[oklch(0.52_0.22_268)] text-primary-foreground shadow-glow-sm",
        icon: "h-9 w-9 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-xl px-5 text-sm",
        xl: "h-12 rounded-xl px-6 text-sm",
        icon: "h-9 w-9 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
