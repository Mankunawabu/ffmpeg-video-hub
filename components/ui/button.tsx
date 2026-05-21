import * as React from "react";
import { cn } from "@/lib/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
};

const variants = {
  default: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]",
  secondary: "bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/10",
  outline: "border border-neutral-200 dark:border-white/10 bg-transparent text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5",
  ghost: "bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5",
  destructive: "bg-red-500 text-white hover:bg-red-600"
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  default: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-sm rounded-2xl"
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
