"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pink-700 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-pink-700 text-white",
        secondary:
          "border-transparent bg-amber-600 text-white",
        outline: "border-pink-700 text-pink-700",
        success:
          "border-transparent bg-green-600 text-white",
        warning:
          "border-transparent bg-yellow-500 text-white",
        danger:
          "border-transparent bg-red-600 text-white",
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
