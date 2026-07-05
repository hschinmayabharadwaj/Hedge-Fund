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
import { Card, StatusDot, TimeframeToggle } from "@/components/ui/Card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  Stagger,
  StaggerItem,
  FadeIn,
  MotionButton,
  TableRow,
  AnimatedProgress,
  PulseDot,
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

  return (
    <div>
      <FadeIn className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Global Portfolio Command</h2>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            <PulseDot className="w-1.5 h-1.5 bg-secondary" />
            Live Data Feed Active • Last updated: 09:42:15 NYT
          </p>
        </div>
        <MotionButton className="px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-label-uppercase text-on-surface hover:bg-surface-container-high transition-colors">
          Export Report
        </MotionButton>
      </FadeIn>

      <Stagger className="grid grid-cols-12 gap-gutter">
        {KPI_DATA.map((kpi) => (
          <StaggerItem key={kpi.label} className="col-span-12 lg:col-span-3">
          <Card
            insight={kpi.insight}
            className="p-4 flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-uppercase text-on-surface-variant flex items-center gap-1">
                {kpi.insight && <MaterialIcon name="psychology" size={14} className="text-secondary" />}
                {kpi.label}
              </span>
              <MaterialIcon name={kpi.icon} size={16} className="text-outline" />
            </div>
            <div>
              <div
                className={`font-data-mono text-headline-md font-bold ${
                  kpi.valueSecondary ? "text-secondary" : "text-on-surface"
                }`}
              >
                {kpi.value}
              </div>
              <div
                className={`flex items-center gap-1 mt-1 font-data-mono text-body-sm ${
                  kpi.warning ? "text-error" : kpi.positive ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {kpi.warning && <MaterialIcon name="arrow_upward" size={14} />}
                {kpi.positive && !kpi.valueSecondary && <MaterialIcon name="arrow_upward" size={14} />}
                {kpi.change}
              </div>
            </div>
          </Card>
          </StaggerItem>
        ))}

        <StaggerItem className="col-span-12 lg:col-span-8">
        <Card className="p-4 flex flex-col min-h-[320px]" hover={false}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-body-md font-semibold text-on-surface">Fund Performance vs Benchmark</h3>
            <TimeframeToggle options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={FUND_DATA}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#273647" strokeDasharray="0" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#909097", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip
                contentStyle={{
                  background: "#122131",
                  border: "1px solid #45464d",
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: "JetBrains Mono",
                }}
                labelStyle={{ color: "#c6c6cd" }}
              />
              <Area type="monotone" dataKey="fund" stroke="#4edea3" strokeWidth={2} fill="url(#fundGrad)" dot={false} />
              <Line type="monotone" dataKey="benchmark" stroke="#909097" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-4">
        <Card className="p-4 flex flex-col h-full" hover={false}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-body-md font-semibold text-on-surface">Exposure by Sector</h3>
            <MaterialIcon name="pie_chart" size={16} className="text-outline" />
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {SECTORS.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between font-data-mono text-body-sm mb-1">
                  <span className="text-on-surface">{s.name}</span>
                  <span className="text-on-surface-variant">{s.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <AnimatedProgress width={`${s.pct}%`} className={s.color} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-8">
        <Card className="overflow-hidden flex flex-col" hover={false}>
          <div className="p-4 border-b border-outline-variant bg-surface-container flex justify-between items-center">
            <h3 className="text-body-md font-semibold text-on-surface">Top Holdings (Equity Book)</h3>
            <span className="px-2 py-0.5 rounded bg-surface-bright text-on-surface-variant text-label-uppercase text-[10px] border border-outline-variant">
              Long
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-variant">
                  {["Ticker", "Position (M)", "Avg Price", "Last", "Daily P&L", "Action"].map((h, i) => (
                    <th
                      key={h}
                      className={`text-body-sm text-on-surface-variant font-medium py-2 px-4 whitespace-nowrap ${
                        i > 0 && i < 5 ? "text-right" : i === 5 ? "text-center" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-data-mono text-body-sm text-on-surface">
                {HOLDINGS.map((h, i) => (
                  <TableRow
                    key={h.ticker}
                    index={i}
                    className="border-b border-surface-variant/50"
                  >
                    <td className="py-2 px-4 font-bold">{h.ticker}</td>
                    <td className="py-2 px-4 text-right">{h.position}</td>
                    <td className="py-2 px-4 text-right">{h.avgPrice}</td>
                    <td className="py-2 px-4 text-right">{h.last}</td>
                    <td className={`py-2 px-4 text-right ${h.positive ? "text-secondary" : "text-error"}`}>
                      {h.pnl}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        className={`px-2 py-1 bg-surface border border-outline-variant rounded text-[10px] ${
                          h.positive ? "hover:text-secondary" : "hover:text-error"
                        }`}
                      >
                        {h.action}
                      </button>
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-4">
        <Card className="p-4 flex flex-col h-full" hover={false}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-body-md font-semibold text-on-surface">Aggregated Data Feeds</h3>
            <MaterialIcon name="settings_input_antenna" size={16} className="text-outline" />
          </div>
          <div className="flex flex-col gap-0.5">
            {FEEDS.map((feed, i) => (
              <div
                key={feed.name}
                className={`flex justify-between items-center py-2.5 ${
                  i < FEEDS.length - 1 ? "border-b border-surface-variant" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={feed.status} glow={feed.status === "ok"} />
                  <span className={`text-body-sm truncate ${feed.status === "error" ? "text-error" : "text-on-surface"}`}>
                    {feed.name}
                  </span>
                </div>
                <span
                  className={`font-data-mono text-[10px] flex-shrink-0 ml-2 flex items-center gap-1 ${
                    feed.status === "ok"
                      ? "text-on-surface-variant"
                      : feed.status === "warn"
                        ? "text-tertiary"
                        : "text-error"
                  }`}
                >
                  {feed.reconnecting && <MaterialIcon name="refresh" size={12} />}
                  {feed.ping}
                </span>
              </div>
            ))}
          </div>
        </Card>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
