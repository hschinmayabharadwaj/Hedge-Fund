"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MaterialIcon } from "./MaterialIcon";
import { springGlass } from "@/components/motion";

export function Card({ 
  children, 
  className = "", 
  insight = false, 
  hover = true, 
  glass = true,
  gradient = false
}) {
  const reduced = useReducedMotion();
  const baseClasses = [
    glass ? "glass-card" : "bg-surface-container border border-outline-variant",
    gradient && "gradient-border",
    "rounded-xl",
    insight && "relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-secondary-container before:to-transparent",
    className,
  ].filter(Boolean).join(" ");

  if (reduced || !hover) {
    return <div className={baseClasses}>{children}</div>;
  }

  return (
    <motion.div
      className={baseClasses}
      whileHover={{ 
        y: -4, 
        scale: 1.01,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(125, 211, 252, 0.15)",
        backgroundColor: "rgba(30, 42, 62, 0.9)"
      }}
      whileTap={{ scale: 0.98, y: -1 }}
      transition={springGlass}
    >
      {children}
    </motion.div>
  );
}

export function StatusDot({ status, glow = false, size = "md" }) {
  const sizeMap = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };
  
  const colorMap = {
    ok: "bg-secondary",
    error: "bg-tertiary",
    warn: "bg-accent-yellow",
    info: "bg-primary"
  };
  
  const glowClass = glow && status === "ok" ? "shadow-[0_0_12px_rgba(52,211,153,0.6)]" : "";
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={`${sizeMap[size]} rounded-full flex-shrink-0 ${colorMap[status]} ${glowClass}`} />;
  }

  return (
    <motion.span
      className={`${sizeMap[size]} rounded-full flex-shrink-0 ${colorMap[status]} ${glowClass}`}
      animate={status === "ok" ? { 
        scale: [1, 1.3, 1], 
        boxShadow: ["0 0 0 rgba(52, 211, 153, 0)", "0 0 12px rgba(52, 211, 153, 0.8)", "0 0 0 rgba(52, 211, 153, 0)"] 
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function TimeframeToggle({ options, value, onChange, size = "sm" }) {
  const reduced = useReducedMotion();
  const sizeClasses = size === "sm" ? "text-label-sm px-2 py-1" : "text-body-sm px-3 py-1.5";
  
  return (
    <div className="flex bg-surface-container-low/50 rounded-xl p-1 relative border border-outline-variant/30">
      {options.map((tf) => {
        const isActive = value === tf;
        return (
          <motion.button
            key={tf}
            onClick={() => onChange(tf)}
            className={`relative ${sizeClasses} font-medium rounded-lg transition-colors z-10 ${
              isActive ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={springGlass}
          >
            {isActive && !reduced && (
              <motion.span
                layoutId="timeframe-pill"
                className="absolute inset-0 bg-surface-container-high border border-primary/30 rounded-lg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {isActive && reduced && (
              <span className="absolute inset-0 bg-surface-container-high border border-primary/30 rounded-lg" />
            )}
            <span className="relative">{tf}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  positive, 
  warning, 
  insight = false,
  className = ""
}) {
  return (
    <Card insight={insight} className={`p-5 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-label-md text-on-surface-variant flex items-center gap-1.5">
          {insight && <MaterialIcon name="psychology" size={16} className="text-accent-purple" />}
          {title}
        </span>
        <div className="p-2 rounded-lg bg-surface-container/50">
          <MaterialIcon name={icon} size={18} className="text-outline" />
        </div>
      </div>
      <div className="space-y-1">
        <div className={`font-data-mono-lg font-bold ${
          warning ? "text-tertiary" : positive ? "text-secondary" : "text-on-surface"
        }`}>
          {value}
        </div>
        <div className={`flex items-center gap-1.5 font-data-mono-md ${
          warning ? "text-tertiary" : positive ? "text-secondary/90" : "text-on-surface-variant"
        }`}>
          {warning && <MaterialIcon name="warning" size={14} />}
          {positive && !warning && <MaterialIcon name="arrow_upward" size={14} />}
          {!positive && !warning && <MaterialIcon name="arrow_downward" size={14} />}
          <span>{change}</span>
        </div>
      </div>
    </Card>
  );
}

export function ChartCard({ 
  title, 
  children, 
  timeframeOptions, 
  timeframeValue, 
  onTimeframeChange,
  className = ""
}) {
  return (
    <Card className={`p-5 flex flex-col ${className}`} glass={false}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        {timeframeOptions && (
          <TimeframeToggle 
            options={timeframeOptions} 
            value={timeframeValue} 
            onChange={onTimeframeChange}
          />
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </Card>
  );
}
