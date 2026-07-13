"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, StatusDot, TimeframeToggle, MetricCard, ChartCard } from "@/components/ui/Card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { downloadTextFile } from "@/lib/download";
import {
  Stagger,
  StaggerItem,
  FadeIn,
  MotionButton,
  TableRow,
  AnimatedProgress,
  PulseDot,
  staggerContainerDeluxe,
  staggerItemFloat,
  springGlass,
  motion,
} from "@/components/motion";

const KPI_DATA = [
  { label: "Total AUM", value: "$14.28B", change: "+1.2% (+$171.3M)", positive: true, icon: "account_balance_wallet" },
  { label: "Daily P&L", value: "+$42.5M", change: "vs. Benchmark: +0.4%", positive: true, valueSecondary: true, icon: "show_chart" },
  { label: "YTD Performance", value: "+18.4%", change: "Target: 15.0%", positive: true, icon: "event" },
  { label: "Risk Beta", value: "0.84", change: "+0.02 (Elevated)", warning: true, icon: "warning", insight: true },
];

const FUND_DATA = [
  { date: "Jan", fund: 100, benchmark: 100 },
  { date: "Feb", fund: 102, benchmark: 101 },
  { date: "Mar", fund: 105, benchmark: 102 },
  { date: "Apr", fund: 103, benchmark: 103 },
  { date: "May", fund: 108, benchmark: 104 },
  { date: "Jun", fund: 112, benchmark: 105 },
  { date: "Jul", fund: 115, benchmark: 106 },
  { date: "Aug", fund: 118, benchmark: 107 },
  { date: "Sep", fund: 116, benchmark: 108 },
  { date: "Oct", fund: 120, benchmark: 109 },
  { date: "Nov", fund: 124, benchmark: 110 },
  { date: "Dec", fund: 128, benchmark: 111 },
];

const SECTORS = [
  { name: "Technology", pct: 42.5, color: "bg-primary" },
  { name: "Financials", pct: 21.0, color: "bg-secondary" },
  { name: "Healthcare", pct: 15.8, color: "bg-outline-variant" },
  { name: "Energy", pct: 12.2, color: "bg-error" },
  { name: "Cash / Equivalents", pct: 8.5, color: "bg-surface-bright" },
];

const HOLDINGS = [
  { ticker: "NVDA", position: "2.45", avgPrice: "$420.15", last: "$890.40", pnl: "+$14.2M", action: "TRIM", positive: true },
  { ticker: "MSFT", position: "3.10", avgPrice: "$310.50", last: "$415.20", pnl: "+$8.5M", action: "HOLD", positive: true },
  { ticker: "AAPL", position: "4.80", avgPrice: "$175.00", last: "$171.40", pnl: "-$2.1M", action: "REVIEW", positive: false },
  { ticker: "AMZN", position: "1.95", avgPrice: "$130.20", last: "$178.15", pnl: "+$3.8M", action: "ADD", positive: true },
];

const FEEDS = [
  { name: "BBG Terminal API (NYC)", status: "ok", ping: "2ms ping" },
  { name: "Reuters Eikon Feed", status: "ok", ping: "4ms ping" },
  { name: "LSE Direct Order Book", status: "warn", ping: "Degraded" },
  { name: "Internal NLP Alpha Engine", status: "ok", ping: "Active" },
  { name: "Crypto Exch WebSocket", status: "error", ping: "Reconnecting", reconnecting: true },
];

const TIMEFRAMES = ["1D", "1W", "1M", "YTD"];

export default function DashboardView() {
  const [timeframe, setTimeframe] = useState("1M");

  const handleExportReport = () => {
    const summaryLines = [
      "AlphaEdge Capital - Portfolio Command Export",
      "",
      "KPIs",
      ...KPI_DATA.map((kpi) => `${kpi.label}: ${kpi.value} (${kpi.change})`),
      "",
      "Holdings",
      ...HOLDINGS.map((holding) => `${holding.ticker}: ${holding.position}M | ${holding.last} | ${holding.pnl}`),
      "",
      "Feeds",
      ...FEEDS.map((feed) => `${feed.name}: ${feed.ping}`),
    ];

    downloadTextFile("portfolio-command-report.txt", `${summaryLines.join("\n")}\n`);
  };

  const handleHoldingAction = (holding) => {
    window.alert(`${holding.action} request opened for ${holding.ticker}.`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn className="flex justify-between items-end">
        <div>
          <h2 className="text-headline-lg font-bold text-gradient-primary mb-2">Global Portfolio Command</h2>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
            <PulseDot className="w-2 h-2 bg-secondary animate-pulse-glow" />
            <span className="text-on-surface">Live Data Feed Active</span>
            <span className="text-on-surface-variant">•</span>
            <span>Last updated: 09:42:15 NYT</span>
          </p>
        </div>
        <MotionButton
          type="button"
          onClick={handleExportReport}
          className="glass-surface px-4 py-2 text-label-lg text-on-surface hover-lift hover-glow group relative overflow-hidden"
        >
          <MaterialIcon name="download" size={18} className="mr-2" />
          Export Report
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </MotionButton>
      </FadeIn>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-12 gap-spacing-lg"
        variants={staggerContainerDeluxe}
        initial="hidden"
        animate="show"
      >
        {KPI_DATA.map((kpi) => (
          <motion.div
            key={kpi.label}
            className="col-span-12 lg:col-span-3"
            variants={staggerItemFloat}
          >
            <MetricCard
              title={kpi.label}
              value={kpi.value}
              change={kpi.change}
              icon={kpi.icon}
              positive={kpi.positive}
              warning={kpi.warning}
              insight={kpi.insight}
            />
          </motion.div>
        ))}

        {/* Chart Section */}
        <motion.div 
          className="col-span-12 lg:col-span-8"
          variants={staggerItemFloat}
        >
          <ChartCard
            title="Fund Performance vs Benchmark"
            timeframeOptions={TIMEFRAMES}
            timeframeValue={timeframe}
            onTimeframeChange={setTimeframe}
            className="min-h-[360px]"
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={FUND_DATA}>
                <defs>
                  <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DD3FC" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7DD3FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#B0BFD4", fontSize: 11, fontFamily: "JetBrains Mono" }} 
                  axisLine={{ stroke: "#64748B" }}
                  tickLine={{ stroke: "#64748B" }}
                />
                <YAxis 
                  tick={{ fill: "#B0BFD4", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "#64748B" }}
                  tickLine={{ stroke: "#64748B" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(25, 35, 55, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(125, 211, 252, 0.2)",
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)"
                  }}
                  labelStyle={{ 
                    color: "#F0F6FF",
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fund" 
                  stroke="#34D399" 
                  strokeWidth={3} 
                  fill="url(#fundGrad)" 
                  dot={{ 
                    stroke: "#34D399", 
                    strokeWidth: 2, 
                    fill: "#0F172A", 
                    r: 4 
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: "#34D399", 
                    strokeWidth: 3, 
                    fill: "#0F172A" 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#7DD3FC" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={{ stroke: "#7DD3FC", strokeWidth: 1, fill: "#0F172A", r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Sector Exposure */}
        <motion.div 
          className="col-span-12 lg:col-span-4"
          variants={staggerItemFloat}
        >
          <Card glass gradient className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-title-md font-semibold text-on-surface">Exposure by Sector</h3>
              <div className="p-2 rounded-lg bg-surface-container/50">
                <MaterialIcon name="pie_chart" size={18} className="text-primary" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 justify-center">
              {SECTORS.map((s, i) => (
                <div key={s.name} className="space-y-2">
                  <div className="flex justify-between font-data-mono-md mb-1">
                    <span className="text-on-surface">{s.name}</span>
                    <span className="text-on-surface-variant">{s.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/50 to-transparent" />
                    <AnimatedProgress width={`${s.pct}%`} className={`h-full rounded-full ${s.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Holdings Table */}
        <motion.div 
          className="col-span-12 lg:col-span-8"
          variants={staggerItemFloat}
        >
          <Card glass={false} className="overflow-hidden flex flex-col">
            <div className="p-5 border-b border-outline-variant/30 bg-surface-container flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-title-md font-semibold text-on-surface">Top Holdings (Equity Book)</h3>
                <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-medium text-label-sm">
                  Long Positions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => window.alert("Holdings filter panel opened.")} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <MaterialIcon name="filter_list" size={18} className="text-on-surface-variant" />
                </button>
                <button type="button" onClick={() => window.alert("Holdings sort options opened.")} className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                  <MaterialIcon name="sort" size={18} className="text-on-surface-variant" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/30">
                    {["Ticker", "Position (M)", "Avg Price", "Last", "Daily P&L", "Action"].map((h, i) => (
                      <th
                        key={h}
                        className={`text-label-md text-on-surface-variant font-semibold py-3 px-5 whitespace-nowrap ${
                          i > 0 && i < 5 ? "text-right" : i === 5 ? "text-center" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-data-mono-md text-on-surface">
                  {HOLDINGS.map((h, i) => (
                    <TableRow
                      key={h.ticker}
                      index={i}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-low/30"
                    >
                      <td className="py-3 px-5 font-bold text-title-sm">
                        <div className="flex items-center gap-2">
                          <span>{h.ticker}</span>
                          {h.positive && (
                            <motion.span 
                              className="w-1.5 h-1.5 rounded-full bg-secondary"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">{h.position}</td>
                      <td className="py-3 px-5 text-right">{h.avgPrice}</td>
                      <td className="py-3 px-5 text-right">{h.last}</td>
                      <td className={`py-3 px-5 text-right font-bold ${h.positive ? "text-secondary" : "text-tertiary"}`}>
                        {h.pnl}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <motion.button
                          type="button"
                          onClick={() => handleHoldingAction(h)}
                          className={`px-3 py-1.5 rounded-lg border text-label-sm font-medium transition-colors ${
                            h.positive 
                              ? "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20" 
                              : "bg-tertiary/10 border-tertiary/30 text-tertiary hover:bg-tertiary/20"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={springGlass}
                        >
                          {h.action}
                        </motion.button>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Data Feeds */}
        <motion.div 
          className="col-span-12 lg:col-span-4"
          variants={staggerItemFloat}
        >
          <Card gradient className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-title-md font-semibold text-on-surface">Aggregated Data Feeds</h3>
              <div className="p-2 rounded-lg bg-surface-container/50">
                <MaterialIcon name="settings_input_antenna" size={18} className="text-accent-purple" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {FEEDS.map((feed, i) => (
                <motion.div
                  key={feed.name}
                  className={`flex justify-between items-center p-3 rounded-lg hover:bg-surface-container-low/50 transition-colors ${
                    i < FEEDS.length - 1 ? "border-b border-outline-variant/20" : ""
                  }`}
                  whileHover={{ x: 3 }}
                  transition={springGlass}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusDot status={feed.status} glow={feed.status === "ok"} size="lg" />
                    <div>
                      <span className={`text-body-sm block truncate ${feed.status === "error" ? "text-tertiary" : "text-on-surface"}`}>
                        {feed.name}
                      </span>
                      <span className="text-label-sm text-on-surface-variant">
                        {feed.status === "ok" ? "Online" : feed.status === "warn" ? "Degraded" : "Error"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-data-mono-sm flex-shrink-0 ml-2 flex items-center gap-1 ${
                      feed.status === "ok"
                        ? "text-secondary"
                        : feed.status === "warn"
                          ? "text-accent-yellow"
                          : "text-tertiary"
                    }`}
                  >
                    {feed.reconnecting && (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <MaterialIcon name="refresh" size={12} />
                      </motion.span>
                    )}
                    {feed.ping}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
