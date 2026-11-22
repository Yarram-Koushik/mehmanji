"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#C5A059]/30 bg-[#FBF8F1] text-[#C5A059]",
        secondary:
          "border-[#EAE5DF] bg-[#FAF8F5] text-[#6E6A63]",
        outline:
          "border-[#EAE5DF] text-[#1F1E1C]",
        success:
          "border-[#7A8B74]/30 bg-[#F2F5F0] text-[#7A8B74]",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700",
        danger:
          "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
