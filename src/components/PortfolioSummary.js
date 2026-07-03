"use client";

import { useState, useEffect } from "react";

export default function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        const data = await res.json();
        setPortfolio(data[0] || null);
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-default p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded w-36 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-20"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-card rounded-lg border border-default p-4">
        <p className="text-gray-500 text-sm">No portfolio data</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-default p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{portfolio.name}</h3>
      <div className="text-3xl font-bold mb-1">
        ${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">Invested</span>
          <span className="ml-2 font-medium">${portfolio.invested?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">P&L</span>
          <span className={`ml-2 font-medium ${(portfolio.pnl || 0) >= 0 ? "text-green" : "text-red"}`}>
            {portfolio.pnl >= 0 ? "+" : ""}${portfolio.pnl?.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">{portfolio.tradeCount} trades executed</div>
      <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, portfolio.pnlPercent + 50))}%` }}
        ></div>
      </div>
    </div>
  );
}
