"use client";

import { useToast } from "./use-toast";
import { ToastComponent } from "./toast";

function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]">
      {toasts.map((t) => (
        <ToastComponent key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export { Toaster };
