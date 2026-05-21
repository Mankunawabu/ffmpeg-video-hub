"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "danger";
};

type ToastContextValue = {
  toast: (toast: Omit<ToastMessage, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = ((event: CustomEvent<Omit<ToastMessage, "id">>) => {
      const id = crypto.randomUUID();
      const next = { id, ...event.detail };
      setMessages((current) => [...current, next]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 4200);
    }) as EventListener;

    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className={cn(
              "pointer-events-auto rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/95 dark:bg-neutral-900/95 p-4 shadow-xl backdrop-blur-md text-neutral-900 dark:text-white",
              message.variant === "success" && "border-emerald-200 dark:border-emerald-500/30",
              message.variant === "danger" && "border-red-200 dark:border-red-500/30"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold tracking-tight">{message.title}</p>
                {message.description ? (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{message.description}</p>
                ) : null}
              </div>
              <button
                onClick={() => setMessages((current) => current.filter((item) => item.id !== message.id))}
                className="rounded-lg p-1 text-neutral-500 dark:text-neutral-400 transition hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (toast) => {
        window.dispatchEvent(new CustomEvent("app-toast", { detail: toast }));
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam Providers");
  }
  return context;
}
