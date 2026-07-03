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
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <main className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <TopNav
          searchPlaceholder={searchPlaceholder}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          showSearch={navVariant.showSearch}
          showProfile={navVariant.showProfile}
          categoryStyle={navVariant.categoryStyle}
        />
        <div className="flex-1 mt-12 p-margin-mobile md:p-margin-desktop bg-background overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
