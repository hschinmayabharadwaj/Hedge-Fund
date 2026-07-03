"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "ai-insights", label: "AI Insights", icon: "psychology" },
  { id: "market-live", label: "Market Live", icon: "monitoring" },
  { id: "portfolios", label: "Portfolios", icon: "account_balance_wallet" },
];

const LOGO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTE7YnN-mNd7NOQErUBSvvH_zaXEWm9RnJ3o3QhYy19cvZfqkSFSLfhDqNrnK2QRRRpy7Mm6d7YJ80jzWl93RJm60hWZtViC_kPmEqhCeQmYWFL2aUbVM3Zk4IrbBqStJlJGVnXmvOKHiTT9e_-G71iSicM7eBzGRVMBtTZThphdJ5If_q8WHG__4Kby86kpSWryGjHEY7R5nuU3Zu76Q7DHr6jklfvvX1E2v9i8qscq23Fi6ZJWy_7A";

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="hidden md:flex bg-surface-container border-r border-outline-variant fixed left-0 top-0 h-full w-[240px] flex-col py-margin-desktop z-40">
      <div className="px-margin-desktop mb-8">
        <div className="flex items-center gap-3">
          <img alt="AlphaEdge Capital" className="w-8 h-8 rounded-full object-cover" src={LOGO_IMG} />
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">AlphaEdge Capital</h1>
            <p className="text-body-sm text-on-surface-variant">Institutional Terminal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors duration-150 ${
                isActive
                  ? "text-secondary font-bold border-l-2 border-secondary bg-surface-container-high"
                  : "font-medium text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              <MaterialIcon name={icon} filled={isActive} size={20} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="px-3 mt-auto mb-4 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-150 w-full text-left">
          <MaterialIcon name="notifications_active" size={20} />
          Market Alerts
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-150 w-full text-left">
          <MaterialIcon name="settings" size={20} />
          Settings
        </button>
      </div>

      <div className="px-4">
        <button className="w-full bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary py-2 rounded text-label-uppercase transition-colors flex items-center justify-center gap-2">
          <MaterialIcon name="analytics" size={16} />
          Analyze Risk
        </button>
      </div>
    </nav>
  );
}
