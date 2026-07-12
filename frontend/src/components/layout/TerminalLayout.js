"use client";

import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const NAV_VARIANTS = {
  dashboard: { showSearch: true, showProfile: false, categoryStyle: "underline" },
  "ai-insights": { showSearch: true, showProfile: false, categoryStyle: "underline" },
  "market-live": { showSearch: true, showProfile: false, categoryStyle: "underline" },
  portfolios: { showSearch: false, showProfile: true, categoryStyle: "plain" },
};

export default function TerminalLayout({
  children,
  activeView,
  onNavigate,
  searchPlaceholder,
  activeCategory,
  onCategoryChange,
}) {
  const navVariant = NAV_VARIANTS[activeView] || NAV_VARIANTS.dashboard;

  return (
    <div className="min-h-screen w-full flex relative">
      <div className="fixed inset-0 bg-gradient-to-br from-[#070E1A] via-[#0B1524] to-[#0D1828] -z-20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(52,211,153,0.06)_0%,transparent_50%)] -z-20" />
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
        <TopNav
          activeView={activeView}
          searchPlaceholder={searchPlaceholder}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          onNavigate={onNavigate}
          showSearch={navVariant.showSearch}
          showProfile={navVariant.showProfile}
          categoryStyle={navVariant.categoryStyle}
        />
        <div className="flex-1 mt-16 p-spacing-md md:p-spacing-xl overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
