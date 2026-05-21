"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Upload,
  History,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme-toggle";

function OnlineStatus({ compact = false }: { compact?: boolean }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
      online
        ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
        : "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10",
      compact ? "" : "w-full"
    )}>
      <span className={cn(
        "h-2 w-2 rounded-full",
        online ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" : "bg-red-500"
      )} />
      <span className={cn(
        "text-xs font-semibold",
        online ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
      )}>
        {online ? "Online" : "Offline"}
      </span>
    </div>
  );
}

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/compress", label: "Kompresi", icon: Upload },
  { href: "/results", label: "Hasil", icon: History }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 dark:bg-[#050505] bg-[#f8f9fb]" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-6 px-4 py-4 md:px-6 lg:px-8">
        
        {/* Header Navigation */}
        <header className="glass relative flex flex-wrap items-center justify-between gap-4 rounded-full px-5 py-3 shadow-sm z-50">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Video className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-none">
                FFmpeg
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mt-1">
                Video Hub
              </p>
            </div>
          </div>

          {/* Floating Center Navigation */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 rounded-full border border-neutral-200/50 dark:border-white/[0.04] bg-neutral-100/50 dark:bg-white/[0.02] p-1 shadow-inner">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 relative",
                    active
                      ? "text-emerald-700 dark:text-emerald-100"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-white/5"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full bg-white dark:bg-emerald-500/20 shadow-sm border border-neutral-200 dark:border-emerald-500/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Tools */}
          <div className="flex items-center gap-3">
            <OnlineStatus compact />
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation (shows only on small screens) */}
        <div className="md:hidden flex items-center justify-center gap-1 rounded-full border border-neutral-200/50 dark:border-white/[0.04] bg-neutral-100/50 dark:bg-white/[0.02] p-1 glass">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all",
                  active
                    ? "bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-100 shadow-sm border border-neutral-200 dark:border-emerald-500/30"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-0 flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
