"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LayoutGroup, SidebarNavItem, motion, useReducedMotion, springGlass, glassEffect } from "@/components/motion";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", color: "text-primary" },
  { id: "ai-insights", label: "AI Insights", icon: "psychology", color: "text-accent-purple" },
  { id: "market-live", label: "Market Live", icon: "monitoring", color: "text-secondary" },
  { id: "portfolios", label: "Portfolios", icon: "account_balance_wallet", color: "text-accent-teal" },
];

const LOGO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTE7YnN-mNd7NOQErUBSvvH_zaXEWm9RnJ3o3QhYy19cvZfqkSFSLfhDqNrnK2QRRRpy7Mm6d7YJ80jzWl93RJm60hWZtViC_kPmEqhCeQmYWFL2aUbVM3Zk4IrbBqStJlJGVnXmvOKHiTT9e_-G71iSicM7eBzGRVMBtTZThphdJ5If_q8WHG__4Kby86kpSWryGjHEY7R5nuU3Zu76Q7DHr6jklfvvX1E2v9i8qscq23Fi6ZJWy_7A";

function SidebarMotion({ children, className }) {
  const reduced = useReducedMotion();
  if (reduced) return <nav className={className}>{children}</nav>;
  return (
    <motion.nav
      className={className}
      initial={{ x: -30, opacity: 0, scale: 0.98 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ ...springGlass, delay: 0.1 }}
    >
      {children}
    </motion.nav>
  );
}

export default function Sidebar({ activeView, onNavigate }) {
  const utilityItems = [
    { icon: "notifications_active", label: "Market Alerts", badge: 3, target: "market-live" },
    { icon: "settings", label: "Settings", target: "portfolios" },
    { icon: "help", label: "Documentation", target: "ai-insights" },
  ];

  return (
    <SidebarMotion className="hidden md:flex glass-elevated gradient-border fixed left-0 top-0 h-full w-[280px] flex-col py-spacing-xl z-40">
      {/* Logo & Brand */}
      <motion.div
        className="px-spacing-md mb-spacing-lg"
        initial={{ opacity: 0, y: -15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, ...springGlass }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={springGlass}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-md" />
              <motion.img
                alt="AlphaEdge Capital"
                className="w-8 h-8 rounded-lg object-cover relative z-10"
                src={LOGO_IMG}
                whileHover={{ scale: 1.15, rotate: -2 }}
                transition={springGlass}
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background" />
          </motion.div>
          <div>
            <motion.h1 
              className="text-headline-md font-bold text-on-surface text-gradient-primary"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              AlphaEdge
            </motion.h1>
            <motion.p 
              className="text-label-md text-on-surface-variant"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              AI Trading Terminal
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <LayoutGroup>
        <div className="flex-1 px-spacing-sm space-y-2">
          {NAV_ITEMS.map(({ id, label, icon, color }, i) => {
            const isActive = activeView === id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, ...springGlass }}
              >
                <SidebarNavItem
                  isActive={isActive}
                  onClick={() => onNavigate(id)}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-300 ${
                    isActive
                      ? `${color} font-semibold bg-surface-container-high/50`
                      : "font-medium text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent"
                      transition={springGlass}
                    />
                  )}
                  <motion.div
                    className={`relative z-10 p-2 rounded-lg ${isActive ? 'bg-surface-container' : 'bg-surface-container-low/50 group-hover:bg-surface-container-low'}`}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={springGlass}
                  >
                    <MaterialIcon 
                      name={icon} 
                      filled={isActive} 
                      size={20} 
                      className={isActive ? color : 'text-on-surface-variant group-hover:text-on-surface'}
                    />
                  </motion.div>
                  <span className="relative z-10 text-title-md">{label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute right-4 w-2 h-2 rounded-full bg-secondary animate-pulse-glow"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, ...springGlass }}
                    />
                  )}
                </SidebarNavItem>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Utilities */}
      <motion.div
        className="px-spacing-sm mt-auto mb-spacing-md space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {utilityItems.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            onClick={() => onNavigate?.(item.target)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left hover-lift hover-glow"
            whileHover={{ x: 3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springGlass}
          >
            <div className="relative p-2 rounded-lg bg-surface-container-low/50 group-hover:bg-surface-container-low">
              <MaterialIcon name={item.icon} size={20} className="text-on-surface-variant group-hover:text-primary" />
              {item.badge && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-tertiary rounded-full text-[10px] font-bold text-on-tertiary flex items-center justify-center border border-background"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {item.badge}
                </motion.span>
              )}
            </div>
            <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface">{item.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Action Button */}
      <motion.div
        className="px-spacing-sm"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, ...springGlass }}
      >
        <motion.button
          type="button"
          onClick={() => onNavigate?.("ai-insights")}
          className="w-full bg-gradient-secondary text-on-secondary-container hover:shadow-lg py-3 rounded-xl text-label-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={springGlass}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent-teal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MaterialIcon name="analytics" size={18} className="relative z-10" />
          <span className="relative z-10">Analyze Risk</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-accent-teal/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </motion.button>
      </motion.div>

      {/* User Profile */}
      <motion.div
        className="px-spacing-sm mt-spacing-md pt-spacing-md border-t border-outline-variant/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors duration-300">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={springGlass}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-primary overflow-hidden border-2 border-surface-container">
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary rounded-full border border-background" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-on-surface truncate">Alexander Chen</p>
            <p className="text-label-sm text-on-surface-variant">Lead Portfolio Manager</p>
          </div>
          <MaterialIcon name="expand_more" size={16} className="text-on-surface-variant" />
        </div>
      </motion.div>
    </SidebarMotion>
  );
}
