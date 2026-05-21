import * as React from "react";
import { cn } from "@/lib/cn";

export function Progress({
  value = 0,
  className
}: {
  value?: number;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
