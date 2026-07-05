"use client";

import { MotionCard } from "@/components/motion";
import { motion, useReducedMotion } from "framer-motion";

export function Card({ children, className = "", insight = false, hover = true }) {
  return (
    <MotionCard className={className} insight={insight} hover={hover}>
      {children}
    </MotionCard>
  );
}

export function StatusDot({ status, glow = false }) {
  const map = {
    ok: "bg-secondary",
    error: "bg-error",
    warn: "bg-tertiary",
  };
  const glowClass = glow && status === "ok" ? "shadow-[0_0_8px_rgba(78,222,163,0.4)]" : "";
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]} ${glowClass}`} />;
  }

  return (
    <motion.span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]} ${glowClass}`}
      animate={status === "ok" ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function TimeframeToggle({ options, value, onChange }) {
  const reduced = useReducedMotion();
  return (
    <div className="flex bg-surface rounded border border-outline-variant p-0.5 relative">
      {options.map((tf) => {
        const isActive = value === tf;
        return (
          <button
            key={tf}
            onClick={() => onChange(tf)}
            className={`relative px-2 py-0.5 text-label-uppercase text-[10px] rounded-sm transition-colors z-10 ${
              isActive ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {isActive && !reduced && (
              <motion.span
                layoutId="timeframe-pill"
                className="absolute inset-0 bg-surface-container-highest border border-outline-variant rounded-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {isActive && reduced && (
              <span className="absolute inset-0 bg-surface-container-highest border border-outline-variant rounded-sm" />
            )}
            <span className="relative">{tf}</span>
          </button>
        );
      })}
    </div>
  );
}
