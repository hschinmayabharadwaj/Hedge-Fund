"use client";

import { useState, useEffect } from "react";

export default function UnifiedFeedTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/market");
        const result = await res.json();
        if (Array.isArray(result)) setData(result);
      } catch (err) {
        console.error("Feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
    const interval = setInterval(fetchFeed, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-default p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-32 mb-3"></div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-700 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-default overflow-hidden">
      <div className="px-4 py-2 border-b border-default">
        <h3 className="text-sm font-semibold text-gray-300">Unified Market Feed</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-default">
              <th className="text-left px-4 py-2 font-medium">Symbol</th>
              <th className="text-right px-4 py-2 font-medium">Price</th>
              <th className="text-right px-4 py-2 font-medium">24h Chg</th>
              <th className="text-right px-4 py-2 font-medium">Volume</th>
              <th className="text-right px-4 py-2 font-medium">Bid</th>
              <th className="text-right px-4 py-2 font-medium">Ask</th>
              <th className="text-right px-4 py-2 font-medium">Spread</th>
              <th className="text-right px-4 py-2 font-medium">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {data.map((row) => (
              <tr key={row.symbol} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2.5 font-medium">{row.symbol}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${row.change24h >= 0 ? "text-green" : "text-red"}`}>
                  ${row.price?.toFixed(2)}
                </td>
                <td className={`px-4 py-2.5 text-right ${row.change24h >= 0 ? "text-green" : "text-red"}`}>
                  {row.change24h >= 0 ? "+" : ""}{row.change24h?.toFixed(2)}%
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400">
                  {(row.volume / 1000000).toFixed(1)}M
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400">
                  ${row.bid?.toFixed(2) || "-"}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400">
                  ${row.ask?.toFixed(2) || "-"}
                </td>
                <td className="px-4 py-2.5 text-right text-gray-400">
                  {row.spread?.toFixed(3) || "-"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs bg-gray-700 rounded px-1.5 py-0.5">
                    {row.sources?.length || 1}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
