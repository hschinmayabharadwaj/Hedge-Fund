"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { LayoutGroup, SidebarNavItem, motion, useReducedMotion } from "@/components/motion";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "ai-insights", label: "AI Insights", icon: "psychology" },
  { id: "market-live", label: "Market Live", icon: "monitoring" },
  { id: "portfolios", label: "Portfolios", icon: "account_balance_wallet" },
];

const LOGO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTE7YnN-mNd7NOQErUBSvvH_zaXEWm9RnJ3o3QhYy19cvZfqkSFSLfhDqNrnK2QRRRpy7Mm6d7YJ80jzWl93RJm60hWZtViC_kPmEqhCeQmYWFL2aUbVM3Zk4IrbBqStJlJGVnXmvOKHiTT9e_-G71iSicM7eBzGRVMBtTZThphdJ5If_q8WHG__4Kby86kpSWryGjHEY7R5nuU3Zu76Q7DHr6jklfvvX1E2v9i8qscq23Fi6ZJWy_7A";

function SidebarMotion({ children, className }) {
  const reduced = useReducedMotion();
  if (reduced) return <nav className={className}>{children}</nav>;
  return (
    <motion.nav
      className={className}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.nav>
  );
}

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <SidebarMotion className="hidden md:flex bg-surface-container border-r border-outline-variant fixed left-0 top-0 h-full w-[240px] flex-col py-margin-desktop z-40">
      <motion.div
        className="px-margin-desktop mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <motion.img
            alt="AlphaEdge Capital"
            className="w-8 h-8 rounded-full object-cover"
            src={LOGO_IMG}
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">AlphaEdge Capital</h1>
            <p className="text-body-sm text-on-surface-variant">Institutional Terminal</p>
          </div>
        </div>
      </motion.div>

      <LayoutGroup>
        <div className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon }, i) => {
            const isActive = activeView === id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.35 }}
              >
                <SidebarNavItem
                  isActive={isActive}
                  onClick={() => onNavigate(id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left ${
                    isActive
                      ? "text-secondary font-bold"
                      : "font-medium text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <MaterialIcon name={icon} filled={isActive} size={20} />
                  {label}
                </SidebarNavItem>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>

      <motion.div
        className="px-3 mt-auto mb-4 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {[
          { icon: "notifications_active", label: "Market Alerts" },
          { icon: "settings", label: "Settings" },
        ].map((item) => (
          <motion.button
            key={item.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-150 w-full text-left"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
          >
            <MaterialIcon name={item.icon} size={20} />
            {item.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          className="w-full bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary py-2 rounded text-label-uppercase transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(78, 222, 163, 0.2)" }}
          whileTap={{ scale: 0.97 }}
        >
          <MaterialIcon name="analytics" size={16} />
          Analyze Risk
        </motion.button>
      </motion.div>
    </SidebarMotion>
  );
}
