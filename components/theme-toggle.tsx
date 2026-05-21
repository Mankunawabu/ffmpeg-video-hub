"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex h-10 w-10 items-center justify-center rounded-2xl glass-card glass-hover overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center text-emerald-500">
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 0 : 1,
            rotate: theme === "dark" ? -90 : 0,
            opacity: theme === "dark" ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute"
        >
          <Sun className="h-5 w-5" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : 90,
            opacity: theme === "dark" ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute"
        >
          <Moon className="h-5 w-5" />
        </motion.div>
      </div>
    </button>
  );
}
