"use client";

import { useState, useEffect } from "react";

const SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "SPY"];

export default function MarketMonitor() {
  const [tickers, setTickers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch("/api/market");
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((d) => { map[d.symbol] = d; });
          setTickers(map);
        }
      } catch (err) {
        console.error("Market monitor error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-lg border border-default overflow-hidden">
      <div className="px-4 py-2 border-b border-default flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Market Monitor</h3>
        <span className="flex items-center gap-1 text-xs text-green">
          <span className="w-1.5 h-1.5 bg-green rounded-full inline-block animate-pulse"></span>
          Live
        </span>
      </div>
      <div className="divide-y divide-default">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 animate-pulse flex justify-between">
              <div className="h-3 bg-gray-700 rounded w-12"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          ))
        ) : (
          SYMBOLS.map((sym) => {
            const ticker = tickers[sym];
            if (!ticker) return null;
            const isUp = ticker.change24h >= 0;
            return (
              <div key={sym} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div>
                  <span className="font-medium text-sm">{sym}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {ticker.sources?.length || 1} src
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">${ticker.price?.toFixed(2)}</div>
                  <div className={`text-xs ${isUp ? "text-green" : "text-red"}`}>
                    {isUp ? "+" : ""}{ticker.change24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
