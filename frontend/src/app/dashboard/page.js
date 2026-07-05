"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { MotionPage, LoadingSpinner } from "@/components/motion";
import TerminalLayout from "@/components/layout/TerminalLayout";
import DashboardView from "@/components/views/DashboardView";
import AIInsightsView from "@/components/views/AIInsightsView";
import MarketLiveView from "@/components/views/MarketLiveView";
import PortfoliosView from "@/components/views/PortfoliosView";

const SEARCH_PLACEHOLDERS = {
  dashboard: "Command (e.g., /ticker AAPL, /run_model alpha_v4)",
  "ai-insights": "Search parameters, models, assets...",
  "market-live": "Search Ticker, Asset, ISIN...",
  portfolios: "Search funds, positions, assets...",
};

const VIEWS = {
  dashboard: DashboardView,
  "ai-insights": AIInsightsView,
  "market-live": MarketLiveView,
  portfolios: PortfoliosView,
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState("dashboard");
  const [activeCategory, setActiveCategory] = useState("Equities");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) return null;

  const ActiveView = VIEWS[activeView] || DashboardView;

  return (
    <TerminalLayout
      activeView={activeView}
      onNavigate={setActiveView}
      searchPlaceholder={SEARCH_PLACEHOLDERS[activeView]}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    >
      <AnimatePresence mode="wait">
        <MotionPage key={activeView}>
          <ActiveView />
        </MotionPage>
      </AnimatePresence>
    </TerminalLayout>
  );
}
