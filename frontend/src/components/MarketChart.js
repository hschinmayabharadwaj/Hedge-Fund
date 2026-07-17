"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

function MiniChart({ data, color = "#3b82f6", height = 60, width = 160 }) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-on-surface-variant text-xs"
      >
        No data
      </div>
    );
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

  return (
    <motion.svg
      width={width}
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill={`url(#grad-${color})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </motion.svg>
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-lg border border-outline p-4"
      >
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-16 w-full" />
      </motion.div>
    );
  }

  const isUp =
    history.length >= 2 &&
    history[history.length - 1]?.price >= (history[0]?.price || 0);
  const changePercent =
    history.length >= 2
      ? (((history[history.length - 1]?.price || 0) - (history[0]?.price || 0)) /
          (history[0]?.price || 1)) *
        100
      : 0;

  const chartColor = isUp ? "#22C55E" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-lg border border-outline p-4 hover:border-primary/50 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MaterialIcon name="analytics" className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-on-surface">{symbol}</span>
        </div>
        <Badge variant={isUp ? "success" : "destructive"} animate>
          <MaterialIcon
            name={isUp ? "trending_up" : "trending_down"}
            className="w-3 h-3"
          />
          {Math.abs(changePercent).toFixed(2)}%
        </Badge>
      </div>
      <motion.div
        key={price}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        className={cn(
          "text-2xl font-bold mb-2 font-mono",
          isUp ? "text-secondary" : "text-tertiary"
        )}
      >
        ${price?.toFixed(2) || "0.00"}
      </motion.div>
      <MiniChart data={history} color={chartColor} height={60} width={200} />
      <div className="flex justify-between text-xs text-on-surface-variant mt-2 font-mono">
        <div className="flex items-center gap-1">
          <MaterialIcon name="north" className="w-3 h-3 text-secondary" />
          <span>H: ${history[history.length - 1]?.high24h?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex items-center gap-1">
          <MaterialIcon name="south" className="w-3 h-3 text-tertiary" />
          <span>L: ${history[history.length - 1]?.low24h?.toFixed(2) || "0.00"}</span>
        </div>
      </div>
    </motion.div>
  );
}
