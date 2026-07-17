"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Input = forwardRef(
  (
    {
      className,
      type = "text",
      error,
      success,
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputClasses = cn(
      "flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-sm text-on-surface",
      "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-on-surface-variant",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200",
      {
        "border-outline": !error && !success,
        "border-tertiary focus-visible:ring-tertiary": error,
        "border-secondary focus-visible:ring-secondary": success,
        "pl-10": leftIcon,
        "pr-10": rightIcon,
      },
      className
    );

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {rightIcon}
            </div>
          )}
          {isFocused && (
            <motion.div
              className={cn(
                "absolute inset-0 rounded-md pointer-events-none",
                error
                  ? "ring-2 ring-tertiary"
                  : success
                  ? "ring-2 ring-secondary"
                  : "ring-2 ring-primary"
              )}
              layoutId="input-focus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        <AnimatePresence mode="wait">
          {(helperText || error) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "text-xs",
                error ? "text-tertiary" : success ? "text-secondary" : "text-on-surface-variant"
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
