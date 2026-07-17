"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-surface border-outline text-on-surface shadow-lg",
          description: "text-on-surface-variant",
          actionButton:
            "bg-primary text-on-primary hover:bg-primary/90",
          cancelButton:
            "bg-surface-variant text-on-surface-variant hover:bg-surface-bright",
          error: "bg-tertiary-container text-on-tertiary-container border-tertiary",
          success: "bg-secondary-container text-on-secondary-container border-secondary",
          warning: "bg-warning-container text-on-warning-container border-warning",
          info: "bg-primary-container text-on-primary-container border-primary",
        },
      }}
    />
  );
}

// Utility functions for easy toast usage
export { toast } from "sonner";
