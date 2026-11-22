"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#C5A059] text-white shadow-sm hover:bg-[#B08D47] shadow-[#C5A059]/20",
        secondary:
          "bg-[#7A8B74] text-white shadow-sm hover:bg-[#677761] shadow-[#7A8B74]/20",
        outline:
          "border border-[#EAE5DF] bg-white text-[#1F1E1C] shadow-sm hover:bg-[#FAF8F5] hover:border-[#C5A059] hover:text-[#C5A059]",
        ghost:
          "text-[#6E6A63] hover:bg-[#FAF8F5] hover:text-[#1F1E1C]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        link:
          "text-[#C5A059] underline-offset-4 hover:underline",
        forest:
          "bg-[#1F2E23] text-white hover:bg-[#152018] shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-12 rounded-[12px] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
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
export type { ButtonProps };
