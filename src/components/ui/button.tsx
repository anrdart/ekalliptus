import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform-gpu will-change-transform transition-colors transition-transform duration-300 ease-smooth hover:translate-y-[1px] hover:scale-[1.02] active:scale-95 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-gradient text-white shadow-[0_18px_30px_-16px_rgba(56,189,248,0.7)] hover:shadow-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/15 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/10",
        secondary: "bg-secondary/30 text-white/80 hover:bg-secondary/40",
        ghost: "text-white/70 hover:text-white hover:bg-white/10",
        link: "text-sky-300 underline-offset-4 hover:text-white hover:underline",
        hero: "bg-primary-gradient text-primary-foreground shadow-[0_25px_50px_-18px_rgba(37,99,235,0.65)] hover:shadow-glow transform hover:scale-[1.03] ease-smooth font-semibold",
        accent: "bg-accent-gradient text-accent-foreground shadow-[0_25px_45px_-16px_rgba(6,182,212,0.6)] hover:shadow-glow transform hover:scale-[1.03] ease-smooth font-semibold",
        glass: "border border-white/12 bg-white/8 text-white/85 hover:border-white/25 hover:bg-white/12",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-9",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }), "smooth-hover")} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
