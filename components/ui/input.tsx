import * as React from "react";
import { cn } from "@/lib/cn";

export function Input({ className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-500/60 focus:bg-white",
        className
      )}
      {...props}
    />
  );
}
