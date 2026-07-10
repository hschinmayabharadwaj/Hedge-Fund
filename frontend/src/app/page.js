"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { motion, useReducedMotion } from "framer-motion";
import { springGlass } from "@/components/motion";

const FEATURE_CARDS = [
  { 
    icon: "dashboard", 
    title: "Global Portfolio Command", 
    desc: "Real-time AUM tracking, sector exposure, and equity book management.",
    gradient: "from-primary to-secondary"
  },
  { 
    icon: "psychology", 
    title: "Reinforcement Learning Engine", 
    desc: "Self-training RL agent with alpha signals and self-correction logs.",
    gradient: "from-accent-purple to-primary"
  },
  { 
    icon: "monitoring", 
    title: "Live Market Terminal", 
    desc: "Order books, smart alerts, and technical indicators in real time.",
    gradient: "from-secondary to-accent-teal"
  },
];

const ARCHITECTURE_ITEMS = [
  { 
    label: "Data Layer", 
    items: ["4 Sources", "Deduplication", "Unified Format"],
    color: "text-primary"
  },
  { 
    label: "Processing", 
    items: ["Weighted Median", "Redis Cache", "Rate Limiting"],
    color: "text-secondary"
  },
  { 
    label: "AI Engine", 
    items: ["RL Agent", "Self-Training", "Live Predictions"],
    color: "text-accent-purple"
  },
  { 
    label: "Presentation", 
    items: ["Real-Time Charts", "Market Monitor", "Portfolio View"],
    color: "text-accent-teal"
  },
];

const PARTICLE_COUNT = 20;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  const x = (index * 37) % 100;
  const y = (index * 53) % 100;
  const drift = ((index * 29) % 50) - 25;

  return {
    x: `${x}%`,
    y: `${y}%`,
    drift: `${drift}vw`,
    duration: 20 + (index % 10),
    delay: (index % 5) * 0.6,
  };
});

const ParticleBackground = () => {
  const reduced = useReducedMotion();
  if (reduced) return null;
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: [null, '-20vh', '100vh'],
            x: [null, particle.drift],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <div className="fixed inset-0 bg-gradient-to-br from-[#070E1A] via-[#0B1524] to-[#0D1828] -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(52,211,153,0.06)_0%,transparent_50%)] -z-20" />

      {/* Header */}
      <motion.header 
        className="glass-surface px-spacing-xl py-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...springGlass, delay: 0.1 }}
      >
        <div className="max-w-[var(--spacing-container-max)] mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={springGlass}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-md" />
                <MaterialIcon name="blur_on" className="text-on-surface relative z-10" size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background" />
            </div>
            <div>
              <motion.h1 
                className="text-headline-md font-bold text-gradient-primary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                AlphaEdge Capital
              </motion.h1>
              <motion.p 
                className="text-label-md text-on-surface-variant"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Institutional AI Terminal
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="glass-surface px-5 py-2.5 text-body-md text-on-surface hover:text-primary rounded-xl hover-lift hover-glow"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="bg-gradient-secondary text-on-secondary-container px-5 py-2.5 rounded-xl text-label-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
              >
                <span>Access Terminal</span>
                <MaterialIcon name="arrow_forward" size={18} className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-accent-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[var(--spacing-container-max)] mx-auto px-spacing-xl py-spacing-section-padding">
        <motion.div 
          className="text-center mb-spacing-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...springGlass }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, ...springGlass }}
          >
            <h2 className="text-display-sm md:text-display-md font-bold text-gradient-primary mb-4">
              Institutional Trading
              <span className="block text-on-surface">Intelligence</span>
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-3xl mx-auto mb-8">
              Multi-source market aggregation with reinforcement learning for intelligent investment decisions.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button 
              className="px-6 py-3 bg-gradient-primary text-on-primary rounded-xl text-title-md font-semibold hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={springGlass}
            >
              <span className="relative z-10">Request Demo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
            <motion.button 
              className="glass-surface px-6 py-3 text-on-surface rounded-xl text-title-md font-semibold hover-lift hover-glow group relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={springGlass}
            >
              <span className="relative z-10">View Documentation</span>
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-spacing-lg mb-spacing-xl"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.8 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: springGlass }
              }}
            >
              <motion.div 
                className="glass-card gradient-border p-6 h-full hover-lift group"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={springGlass}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-lg" />
                  <MaterialIcon name={card.icon} size={24} className="text-on-surface relative z-10" />
                </div>
                <h3 className="text-title-md font-semibold text-on-surface mb-2">{card.title}</h3>
                <p className="text-body-sm text-on-surface-variant">{card.desc}</p>
                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <button className="text-label-md text-primary hover:text-secondary flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    Learn more
                    <MaterialIcon name="arrow_forward" size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Section */}
        <motion.div 
          className="glass-elevated rounded-2xl p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, ...springGlass }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-sm font-bold text-on-surface">System Architecture</h3>
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
              <MaterialIcon name="settings" size={16} />
              <span>Modular & Scalable</span>
            </div>
          </div>
          <motion.div 
            className="grid md:grid-cols-4 gap-spacing-lg"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {ARCHITECTURE_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1, transition: springGlass }
                }}
              >
                <div className="bg-surface-container-low/50 rounded-xl p-5 border border-outline-variant/30 h-full hover:bg-surface-container-low transition-colors duration-300 group">
                  <div className={`text-title-sm font-semibold mb-3 ${item.color}`}>{item.label}</div>
                  <div className="space-y-2">
                    {item.items.map((subItem, j) => (
                      <motion.div
                        key={j}
                        className="flex items-center gap-2 text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 + (i * 0.1) + (j * 0.05) }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-outline-variant group-hover:bg-primary transition-colors" />
                        {subItem}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="border-t border-outline-variant/30 mt-auto py-spacing-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-spacing-xl text-center">
          <p className="text-body-sm text-on-surface-variant">
            © 2026 AlphaEdge Capital. All rights reserved.
            <span className="mx-2">•</span>
            AI-Powered Institutional Trading Platform
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
