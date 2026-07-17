"use client";

import { motion } from "framer-motion";

// Animation variants for common patterns
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};

export const slideInUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const slideInDown = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
};

// Stagger container variants
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Hover effects
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverLift = {
  whileHover: { y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  whileTap: { y: 0 },
};

export const hoverRotate = {
  whileHover: { rotate: 5 },
  whileTap: { rotate: 0 },
};

// Transition presets
export const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothSpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
};

export const bouncy = {
  type: "spring",
  stiffness: 400,
  damping: 10,
};

export const smooth = {
  duration: 0.3,
  ease: "easeInOut",
};

export const fast = {
  duration: 0.15,
  ease: "easeOut",
};

export const slow = {
  duration: 0.6,
  ease: "easeInOut",
};

// Component wrappers
export function FadeIn({ children, delay = 0, duration = 0.3, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ children, direction = "up", delay = 0, ...props }) {
  const variants = {
    up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    left: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  };

  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, staggerDelay = 0.1, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered animations
export function ScrollReveal({ children, threshold = 0.1, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Loading animations
export function PulseLoader({ size = 40, color = "var(--color-primary)" }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: size / 4,
            height: size / 4,
            backgroundColor: color,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function SpinLoader({ size = 40, color = "var(--color-primary)", strokeWidth = 4 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="80, 200"
        strokeDashoffset="0"
        animate={{
          strokeDashoffset: [0, -125],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

// Page transition wrapper
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
