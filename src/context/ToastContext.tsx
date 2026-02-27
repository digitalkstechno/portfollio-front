import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toasts: Toast[];
  showToast: (message: string, opts?: { type?: ToastType; duration?: number }) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const showToast = useCallback((message: string, opts?: { type?: ToastType; duration?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type: opts?.type ?? "info" };
    setToasts((prev) => [...prev, toast]);
    const dur = opts?.duration ?? 3000;
    timeouts.current[id] = setTimeout(() => removeToast(id), dur);
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
