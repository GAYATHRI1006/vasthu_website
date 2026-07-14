import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-6 py-3 text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-primary/95",
        secondary:
          "bg-secondary px-6 py-3 text-secondary-foreground shadow-panel hover:-translate-y-0.5 hover:bg-secondary/90",
        outline:
          "border border-primary/15 bg-white px-6 py-3 text-primary hover:border-primary/40 hover:bg-primary/5",
        ghost: "px-4 py-2 text-primary hover:bg-primary/5"
      },
      size: {
        default: "h-11",
        lg: "h-12 text-base",
        icon: "h-11 w-11 rounded-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
