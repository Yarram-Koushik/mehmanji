"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast as ToastType } from "./use-toast";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-[#FFFBF5] text-gray-900",
        success: "border-green-600 bg-green-50 text-green-900",
        error: "border-red-600 bg-red-50 text-red-900",
        destructive: "border-red-600 bg-red-50 text-red-900",
        warning: "border-yellow-500 bg-yellow-50 text-yellow-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastComponent({ toast, onDismiss, className, ...props }: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant: toast.variant }), className)}
      data-state="open"
      {...props}
    >
      <div className="grid gap-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-pink-700"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export { ToastComponent, toastVariants };
