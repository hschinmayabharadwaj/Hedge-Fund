"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-on-primary hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-on-secondary hover:bg-secondary/80",
        destructive:
          "border-transparent bg-tertiary text-on-tertiary hover:bg-tertiary/80",
        success:
          "border-transparent bg-secondary text-on-secondary hover:bg-secondary/80",
        warning:
          "border-transparent bg-warning text-on-warning hover:bg-warning/80",
        outline: "text-on-surface border-outline",
        ghost: "bg-surface-variant text-on-surface-variant hover:bg-surface-bright",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, animate = false, children, ...props }) {
  if (animate) {
    return (
      <motion.span
        className={cn(badgeVariants({ variant }), className)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
