"use client";

import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Progress = forwardRef(
  ({ className, value, showLabel = false, animated = true, ...props }, ref) => {
    const percentage = Math.min(Math.max(value || 0, 0), 100);

    return (
      <div className="w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-surface-variant",
            className
          )}
          {...props}
        >
          {animated ? (
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          ) : (
            <ProgressPrimitive.Indicator
              className="h-full w-full flex-1 bg-primary transition-all"
              style={{ transform: `translateX(-${100 - percentage}%)` }}
            />
          )}
        </ProgressPrimitive.Root>
        {showLabel && (
          <div className="mt-1 text-xs text-on-surface-variant text-right">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

const CircularProgress = ({ value = 0, size = 120, strokeWidth = 8, showLabel = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value || 0, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-variant"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
};

export { Progress, CircularProgress };
