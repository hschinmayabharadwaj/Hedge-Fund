"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";

const COMMANDS = [
  {
    group: "Navigation",
    items: [
      { id: "home", label: "Home", icon: "home", action: "/" },
      { id: "dashboard", label: "Dashboard", icon: "dashboard", action: "/dashboard" },
      { id: "market", label: "Market Monitor", icon: "monitoring", action: "/?view=market" },
      { id: "ai", label: "AI Insights", icon: "psychology", action: "/?view=ai" },
      { id: "portfolio", label: "Portfolios", icon: "account_balance", action: "/?view=portfolios" },
    ],
  },
  {
    group: "Actions",
    items: [
      { id: "refresh", label: "Refresh Data", icon: "refresh", action: "refresh" },
      { id: "theme", label: "Toggle Theme", icon: "dark_mode", action: "theme" },
      { id: "fullscreen", label: "Toggle Fullscreen", icon: "fullscreen", action: "fullscreen" },
    ],
  },
  {
    group: "Help",
    items: [
      { id: "docs", label: "Documentation", icon: "description", action: "docs" },
      { id: "shortcuts", label: "Keyboard Shortcuts", icon: "keyboard", action: "shortcuts" },
    ],
  },
];

export function CommandPalette({ onClose }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAction = useCallback(
    (action) => {
      if (action.startsWith("/")) {
        router.push(action);
      } else {
        switch (action) {
          case "refresh":
            window.location.reload();
            break;
          case "theme":
            // Toggle theme logic
            document.documentElement.classList.toggle("dark");
            break;
          case "fullscreen":
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
            break;
          case "docs":
            window.open("/docs", "_blank");
            break;
          case "shortcuts":
            alert("Shortcuts:\n• Ctrl+K: Command Palette\n• Ctrl+R: Refresh\n• F11: Fullscreen");
            break;
        }
      }
      setOpen(false);
      setSearch("");
      onClose?.();
    },
    [router, onClose]
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface bg-surface-variant hover:bg-surface-bright rounded-md transition-all"
      >
        <MaterialIcon name="search" className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-outline bg-surface px-1.5 font-mono text-[10px] font-medium text-on-surface-variant">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Dialog */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Command Dialog */}
            <motion.div
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: -20 }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Command
                className={cn(
                  "rounded-lg border border-outline bg-surface shadow-2xl overflow-hidden"
                )}
                value={search}
                onValueChange={setSearch}
              >
                <div className="flex items-center border-b border-outline px-3">
                  <MaterialIcon name="search" className="w-5 h-5 mr-2 text-on-surface-variant" />
                  <Command.Input
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
                  />
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-outline bg-surface-variant px-1.5 font-mono text-[10px] font-medium text-on-surface-variant">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-on-surface-variant">
                    No results found.
                  </Command.Empty>

                  {COMMANDS.map((group) => (
                    <Command.Group
                      key={group.group}
                      heading={group.group}
                      className="px-2 pt-2 pb-1 text-xs font-semibold text-on-surface-variant"
                    >
                      {group.items.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.label}
                          onSelect={() => handleAction(item.action)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
                            "text-on-surface hover:bg-surface-variant aria-selected:bg-surface-variant"
                          )}
                        >
                          <MaterialIcon name={item.icon} className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>

                <div className="border-t border-outline p-2 text-xs text-on-surface-variant flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-surface-variant">↑↓</kbd> Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-surface-variant">↵</kbd> Select
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-variant">ESC</kbd> Close
                  </span>
                </div>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
