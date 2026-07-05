"use client";

import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";

/* ── Spring presets (21st.dev-style snappy UI) ── */
export const springSnappy = { type: "spring", stiffness: 400, damping: 30 };
export const springSoft = { type: "spring", stiffness: 260, damping: 28 };
export const springBounce = { type: "spring", stiffness: 300, damping: 22, mass: 0.8 };
export const easeOut = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
export const easeInOut = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

export const pageTransition = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
  transition: easeOut,
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springSoft,
  },
};

export const tableRow = {
  hidden: { opacity: 0, x: -8 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, ...springSoft },
  }),
};

export function MotionPage({ children, className = "" }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : pageTransition.initial}
      animate={pageTransition.animate}
      exit={reduced ? undefined : pageTransition.exit}
      transition={reduced ? { duration: 0 } : pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = "", fast = false }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={fast ? staggerContainerFast : staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({ children, className = "", onClick, type = "button", ...props }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <button type={type} className={className} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function MotionCard({ children, className = "", insight = false, hover = true }) {
  const reduced = useReducedMotion();
  const classes = [
    "bg-surface-container border border-outline-variant rounded-lg",
    insight &&
      "relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-secondary-container before:to-transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (reduced || !hover) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      className={classes}
      whileHover={{
        y: -3,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(78, 222, 163, 0.06)",
        backgroundColor: "var(--color-surface-container-high)",
      }}
      transition={springSoft}
    >
      {children}
    </motion.div>
  );
}

export function TableRow({ children, className = "", index = 0 }) {
  const reduced = useReducedMotion();
  if (reduced) return <tr className={className}>{children}</tr>;
  return (
    <motion.tr
      className={className}
      custom={index}
      variants={tableRow}
      initial="hidden"
      animate="show"
      whileHover={{ backgroundColor: "rgba(39, 54, 71, 0.5)" }}
    >
      {children}
    </motion.tr>
  );
}

export function AnimatedProgress({ width, className = "bg-secondary" }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={`h-full rounded-full ${className}`} style={{ width }} />;
  }
  return (
    <motion.div
      className={`h-full rounded-full ${className}`}
      initial={{ width: 0 }}
      animate={{ width }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
    />
  );
}

export function PulseDot({ className = "bg-secondary" }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={`w-2 h-2 rounded-full ${className}`} />;
  return (
    <motion.span
      className={`w-2 h-2 rounded-full block ${className}`}
      animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function LoadingSpinner({ className = "" }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={`w-8 h-8 border-2 border-secondary border-t-transparent rounded-full ${className}`} />
    );
  }
  return (
    <motion.div
      className={`w-8 h-8 border-2 border-secondary border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function SidebarNavItem({ isActive, onClick, children, className = "" }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
  return (
    <motion.button
      onClick={onClick}
      className={`relative ${className}`}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-surface-container-high border-l-2 border-secondary"
          transition={springSoft}
        />
      )}
      <span className="relative z-10 flex items-center gap-3 w-full">{children}</span>
    </motion.button>
  );
}

export { motion, AnimatePresence, LayoutGroup, useReducedMotion };
