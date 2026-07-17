"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-md bg-surface-variant animate-pulse" />
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative overflow-hidden", className)}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MaterialIcon name="dark_mode" className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MaterialIcon name="light_mode" className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

export function ThemeMenu() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themeOptions = [
    { value: "light", label: "Light", icon: "light_mode" },
    { value: "dark", label: "Dark", icon: "dark_mode" },
    { value: "system", label: "System", icon: "computer" },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <MaterialIcon
          name={
            theme === "system"
              ? "computer"
              : theme === "dark"
              ? "dark_mode"
              : "light_mode"
          }
          className="w-4 h-4"
        />
        <span className="capitalize">{theme}</span>
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-40 rounded-lg border border-outline bg-surface shadow-lg z-50 overflow-hidden"
            >
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    theme === option.value
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface hover:bg-surface-variant"
                  )}
                >
                  <MaterialIcon name={option.icon} className="w-4 h-4" />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <MaterialIcon name="check" className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
