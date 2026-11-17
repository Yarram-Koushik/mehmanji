"use client";

import { useCallback, useSyncExternalStore } from "react";

type ToastVariant = "default" | "success" | "error" | "warning" | "destructive";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastAction {
  type: "ADD" | "DISMISS" | "REMOVE";
  toast?: Toast;
  id?: string;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 300;

let count = 0;
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Listener = () => void;

const listeners: Listener[] = [];
let memoryState: { toasts: Toast[] } = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function removeToast(id: string): void {
  timeouts.delete(id);
  memoryState = {
    toasts: memoryState.toasts.filter((t) => t.id !== id),
  };
  emitChange();
}

function scheduleRemoval(id: string): void {
  if (timeouts.has(id)) return;
  const timeout = setTimeout(() => {
    removeToast(id);
  }, TOAST_REMOVE_DELAY);
  timeouts.set(id, timeout);
}

function dispatch(action: ToastAction): void {
  switch (action.type) {
    case "ADD":
      memoryState = {
        toasts: [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;

    case "DISMISS": {
      const id = action.id;
      if (id) {
        scheduleRemoval(id);
      } else {
        memoryState.toasts.forEach((t) => scheduleRemoval(t.id));
      }
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === id || id === undefined ? { ...t } : t
        ),
      };
      break;
    }

    case "REMOVE":
      if (action.id === undefined) {
        memoryState = { toasts: [] };
      } else {
        memoryState = {
          toasts: memoryState.toasts.filter((t) => t.id !== action.id),
        };
      }
      break;
  }

  emitChange();
}

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

function getSnapshot(): { toasts: Toast[] } {
  return memoryState;
}

function getServerSnapshot(): { toasts: Toast[] } {
  return { toasts: [] };
}

interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

function toast(input: ToastInput): { id: string; dismiss: () => void } {
  const id = genId();
  const duration = input.duration ?? 5000;

  dispatch({
    type: "ADD",
    toast: { ...input, id },
  });

  if (duration > 0) {
    setTimeout(() => {
      dispatch({ type: "DISMISS", id });
    }, duration);
  }

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS", id }),
  };
}

function useToast() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = useCallback((id?: string) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}

export { useToast, toast };
export type { Toast, ToastVariant, ToastInput };
