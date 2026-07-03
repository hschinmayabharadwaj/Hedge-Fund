"use client";

import { useState, useEffect, useCallback } from "react";

function MiniChart({ data, color = "#3b82f6", height = 60, width = 160 }) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="flex items-center justify-center text-gray-500 text-xs">No data</div>;
  }

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padding = 4;

  const points = prices.map((p, i) => {
    const x = padding + (i / (prices.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(" L")}`;
  const areaD = `${pathD} L${width - padding},${height - padding} L${padding},${height - padding} Z`;
  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketChart({ symbol, history: initialHistory }) {
  const [price, setPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [history, setHistory] = useState(initialHistory || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/market?symbol=${symbol}&history=50`);
        const data = await res.json();
        setPrice(data.price);
        setPrevPrice(data.price);
        if (data.history) setHistory(data.history);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (price !== null && prevPrice !== null && price !== prevPrice) {
      setPrevPrice(price);
    }
  }, [price]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-default p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-16 bg-gray-700 rounded"></div>
      </div>
    );
  }

  const isUp = history.length >= 2 && history[history.length - 1]?.price >= (history[0]?.price || 0);
  const changePercent = history.length >= 2
    ? (((history[history.length - 1]?.price || 0) - (history[0]?.price || 0)) / (history[0]?.price || 1)) * 100
    : 0;

  const chartColor = isUp ? "#00c853" : "#ff1744";

  return (
    <div className="bg-card rounded-lg border border-default p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-300">{symbol}</span>
        <span className={`text-xs ${isUp ? "text-green" : "text-red"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
        </span>
      </div>
      <div className="text-2xl font-bold mb-0.5">
        ${price?.toFixed(2) || "0.00"}
      </div>
      <MiniChart data={history} color={chartColor} height={60} width={200} />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>24h H: ${history[history.length - 1]?.high24h?.toFixed(2) || "0.00"}</span>
        <span>24h L: ${history[history.length - 1]?.low24h?.toFixed(2) || "0.00"}</span>
      </div>
    </div>
  );
}
