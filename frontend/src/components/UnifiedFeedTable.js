"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    transition: { duration: 0.2 },
  },
};

export default function UnifiedFeedTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/market");
      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (err) {
      console.error("Feed fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-lg border border-outline overflow-hidden p-4"
      >
        <SkeletonTable rows={5} columns={6} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface rounded-lg border border-outline overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-outline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MaterialIcon name="table_chart" className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-on-surface">Unified Market Feed</h3>
          {refreshing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <MaterialIcon name="refresh" className="w-4 h-4 text-on-surface-variant" />
            </motion.div>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          Live
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-on-surface-variant border-b border-outline bg-surface-variant/50">
              <th className="text-left px-4 py-3 font-medium">Symbol</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">24h Chg</th>
              <th className="text-right px-4 py-3 font-medium">Volume</th>
              <th className="text-right px-4 py-3 font-medium">Bid</th>
              <th className="text-right px-4 py-3 font-medium">Ask</th>
              <th className="text-right px-4 py-3 font-medium">Spread</th>
              <th className="text-right px-4 py-3 font-medium">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            <AnimatePresence>
              {data.map((row, index) => (
                <motion.tr
                  key={row.symbol}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="show_chart" className="w-4 h-4 text-primary" />
                      {row.symbol}
                    </div>
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-right font-semibold font-mono",
                    row.change24h >= 0 ? "text-secondary" : "text-tertiary"
                  )}>
                    <motion.span
                      key={row.price}
                      initial={{ scale: 1.1, color: row.change24h >= 0 ? "#22C55E" : "#EF4444" }}
                      animate={{ scale: 1, color: row.change24h >= 0 ? "#22C55E" : "#EF4444" }}
                      transition={{ duration: 0.3 }}
                    >
                      ${row.price?.toFixed(2)}
                    </motion.span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge
                      variant={row.change24h >= 0 ? "success" : "destructive"}
                      className="font-mono"
                    >
                      {row.change24h >= 0 ? "+" : ""}{row.change24h?.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant font-mono">
                    {(row.volume / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant font-mono">
                    ${row.bid?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant font-mono">
                    ${row.ask?.toFixed(2) || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant font-mono">
                    {row.spread?.toFixed(3) || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="outline" className="text-xs font-mono">
                      {row.sources?.length || 1}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
