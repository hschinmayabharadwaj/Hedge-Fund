"use client";

import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";

/* ── Modern Animation Presets ── */
export const springSnappy = { type: "spring", stiffness: 420, damping: 25, mass: 0.8 };
export const springSoft = { type: "spring", stiffness: 280, damping: 30, mass: 0.9 };
export const springBounce = { type: "spring", stiffness: 320, damping: 20, mass: 0.7 };
export const springGlass = { type: "spring", stiffness: 350, damping: 28, mass: 0.85 };
export const easeOutExpo = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
export const easeInOutExpo = { duration: 0.5, ease: [0.4, 0, 0.2, 1] };
export const easeSmooth = { duration: 0.7, ease: [0.32, 0, 0.07, 1] };
export const easeBounce = { duration: 0.8, ease: [0.68, -0.6, 0.32, 1.6] };

export const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.98, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -15, scale: 0.98, filter: "blur(8px)" },
  transition: easeSmooth,
};

export const cardHover = {
  whileHover: { 
    y: -6, 
    scale: 1.02,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(125, 211, 252, 0.15)",
    backgroundColor: "rgba(30, 42, 62, 0.9)"
  },
  whileTap: { scale: 0.98, y: -2 },
  transition: springGlass
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.03 },
  },
};

export const staggerContainerDeluxe = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 15, scale: 0.95, rotateX: 5 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: springSoft,
  },
};

export const staggerItemFloat = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...springBounce, delay: 0.1 },
  },
};

export const tableRow = {
  hidden: { opacity: 0, x: -12, scale: 0.98 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { 
      delay: i * 0.05, 
      type: "spring", 
      stiffness: 300, 
      damping: 25,
      mass: 0.8 
    },
  }),
};

export const glassEffect = {
  whileHover: {
    backdropFilter: "blur(40px) saturate(220%)",
    backgroundColor: "rgba(35, 48, 70, 0.9)",
    borderColor: "rgba(125, 211, 252, 0.25)",
    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(125, 211, 252, 0.2), inset 0 0 20px rgba(125, 211, 252, 0.05)"
  },
  transition: springGlass
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
      transition={{ ...easeOutExpo, delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({ children, className = "", onClick, type = "button", variant = "default", ...props }) {
  const reduced = useReducedMotion();
  
  const variants = {
    default: {
      whileHover: { scale: 1.05, y: -2, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" },
      whileTap: { scale: 0.97, y: 0 }
    },
    glass: {
      whileHover: { scale: 1.03, y: -2, backdropFilter: "blur(40px) saturate(200%)", backgroundColor: "rgba(30, 42, 62, 0.9)" },
      whileTap: { scale: 0.98, y: 0 }
    },
    gradient: {
      whileHover: { scale: 1.04, y: -2, boxShadow: "0 12px 40px rgba(52, 211, 153, 0.2)" },
      whileTap: { scale: 0.96, y: 0 }
    }
  };

  if (reduced) {
    return (
      <button type={type} className={className} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
  
  const variantConfig = variants[variant] || variants.default;
  
  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      whileHover={variantConfig.whileHover}
      whileTap={variantConfig.whileTap}
      transition={springGlass}
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
      whileHover={{ 
        backgroundColor: "rgba(30, 42, 62, 0.6)",
        scale: 1.002,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(125, 211, 252, 0.1)"
      }}
      transition={springSoft}
    >
      {children}
    </motion.tr>
  );
}

export function AnimatedProgress({ width, className = "bg-gradient-to-r from-secondary to-accent-teal" }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={`h-full rounded-full ${className}`} style={{ width }} />;
  }
  return (
    <motion.div
      className={`h-full rounded-full ${className}`}
      initial={{ width: 0, opacity: 0.8 }}
      animate={{ width, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
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

export function HoverGlow({ children, className = "", glowColor = "rgba(125, 211, 252, 0.2)" }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  
  return (
    <motion.div
      className={className}
      whileHover={{ 
        boxShadow: `0 0 40px ${glowColor}`,
        scale: 1.02
      }}
      transition={springGlass}
    >
      {children}
    </motion.div>
  );
}

export function FloatAnimation({ children, className = "", intensity = 10 }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -intensity, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ShimmerEffect({ children, className = "" }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function ScaleIn({ children, className = "", delay = 0 }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  
  return (
    <motion.div
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...springBounce, delay }}
    >
      {children}
    </motion.div>
  );
}

export function GradientBorder({ children, className = "", colors = ["#7DD3FC", "#34D399"] }) {
  return (
    <div className={`relative rounded-xl p-[2px] ${className}`}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-60 blur-sm" />
      <div className="relative bg-surface-container rounded-xl p-5">
        {children}
      </div>
    </div>
  );
}

export { motion, AnimatePresence, LayoutGroup, useReducedMotion };
