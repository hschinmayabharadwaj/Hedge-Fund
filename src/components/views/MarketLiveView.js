"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const AAPL_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKJzKayOIljdIPVmcZxoURT3RXOPBvJncvTS2eQc5uk5cVYd2ijKdzwJZXo0E1Ir5Wv8dNSCP3iEc0LR0BDCrAVVGZBw6gk_OX_huE1HpAMyzBcENQU1ucy_TcKhnJkDKTJvT9-e1icvnYw_RY2SjMMMwZzKfUQu9KMnAyTXTY4LBPO5khDEw9TJrJeAz1TccYmC4HBRvnxJtN9cVFI-Yye56l-T1Ji95m-hLFdOLi-1OHVRpi6WSX6g";

const TIMEFRAMES = ["1D", "1W", "1M", "3M", "YTD"];

const ORDER_ASKS = [
  { size: "1,240", price: "189.55", depth: 80 },
  { size: "550", price: "189.50", depth: 40 },
  { size: "3,100", price: "189.48", depth: 95 },
];

const ORDER_BIDS = [
  { size: "800", price: "189.43", depth: 60 },
  { size: "4,200", price: "189.40", depth: 100 },
  { size: "150", price: "189.35", depth: 15 },
];

const ALERTS = [
  {
    tag: "Volatility Spike",
    tagClass: "bg-error/20 text-error border border-error/30",
    text: "Unusual options activity detected in AAPL expiring this Friday. Call/Put skew indicates hedging against downside risk.",
    time: "10:42 AM",
  },
  {
    tag: "News Sentiment",
    tagClass: "bg-primary/20 text-primary border border-primary/30",
    text: "Positive sentiment surge across major financial outlets regarding upcoming product cycle. Sentiment score +24% vs 7d avg.",
    time: "09:15 AM",
  },
];

function CandlestickChart() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
      <line className="chart-grid" strokeDasharray="2,2" x1="0" x2="1000" y1="50" y2="50" />
      <line className="chart-grid" strokeDasharray="2,2" x1="0" x2="1000" y1="150" y2="150" />
      <line className="chart-grid" strokeDasharray="2,2" x1="0" x2="1000" y1="250" y2="250" />
      <rect fill="#1e293b" height="30" width="10" x="50" y="270" />
      <rect fill="#1e293b" height="20" width="10" x="70" y="280" />
      <rect fill="#1e293b" height="40" width="10" x="90" y="260" />
      <rect fill="#1e293b" height="15" width="10" x="110" y="285" />
      <line stroke="#4edea3" strokeWidth="1.5" x1="55" x2="55" y1="200" y2="150" />
      <rect fill="#4edea3" height="30" width="10" x="50" y="190" />
      <line stroke="#ffb4ab" strokeWidth="1.5" x1="75" x2="75" y1="180" y2="220" />
      <rect fill="#ffb4ab" height="25" width="10" x="70" y="185" />
      <line stroke="#4edea3" strokeWidth="1.5" x1="95" x2="95" y1="170" y2="120" />
      <rect fill="#4edea3" height="40" width="10" x="90" y="160" />
      <path
        d="M50,170 Q150,220 250,150 T450,120 T650,180 T850,90 T1000,100"
        fill="none"
        stroke="#6ffbbe"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
    </svg>
  );
}

function OrderBookRow({ size, price, depth, side }) {
  const isAsk = side === "ask";
  return (
    <tr className="hover:bg-surface-variant relative group">
      <td colSpan={2} className="p-0 relative">
        <div
          className={`absolute right-0 top-0 bottom-0 z-0 ${isAsk ? "bg-error/10" : "bg-secondary/10"}`}
          style={{ width: `${depth}%` }}
        />
        <div className="grid grid-cols-2 font-data-mono text-[12px] py-1 px-0 relative z-10">
          <span className="text-on-surface">{size}</span>
          <span className={`text-right ${isAsk ? "text-error" : "text-secondary"}`}>{price}</span>
        </div>
      </td>
    </tr>
  );
}

export default function MarketLiveView() {
  const [timeframe, setTimeframe] = useState("1M");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-unit md:gap-gutter max-w-[var(--spacing-container-max)] mx-auto w-full">
      {/* Main chart column */}
      <div className="xl:col-span-8 flex flex-col gap-unit md:gap-gutter">
        {/* Ticker header */}
        <div className="bg-surface-container border border-outline-variant rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center border border-outline-variant">
              <img alt="AAPL Logo" className="w-6 h-6 object-contain" src={AAPL_LOGO} />
            </div>
            <div>
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface leading-none font-bold">
                AAPL{" "}
                <span className="text-on-surface-variant text-headline-md font-normal ml-2">
                  Apple Inc.
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-surface-variant text-on-surface px-2 py-0.5 rounded text-label-uppercase text-[10px]">
                  EQUITY
                </span>
                <span className="bg-surface-variant text-on-surface px-2 py-0.5 rounded text-label-uppercase text-[10px]">
                  NASDAQ
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-2">
              <span className="font-data-mono text-secondary text-2xl">189.43</span>
              <span className="font-data-mono text-secondary text-sm">+2.14 (+1.14%)</span>
            </div>
            <span className="text-body-sm text-on-surface-variant">Market Open • Vol: 42.1M</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-surface-container border border-outline-variant rounded p-4 flex-1 min-h-[400px] flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-4 z-10">
            <div className="flex gap-1 bg-surface-container-highest p-1 rounded border border-outline-variant">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 text-[10px] font-label-uppercase transition-colors rounded ${
                    timeframe === tf
                      ? "bg-surface text-secondary border border-outline-variant shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="h-6 w-6 flex items-center justify-center bg-surface-container-highest rounded border border-outline-variant hover:bg-surface-variant text-on-surface-variant">
                <MaterialIcon name="candlestick_chart" size={14} />
              </button>
              <button className="h-6 w-6 flex items-center justify-center bg-surface-container-highest rounded border border-outline-variant hover:bg-surface-variant text-on-surface-variant">
                <MaterialIcon name="show_chart" size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-[240px]">
            <CandlestickChart />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute left-[45%] top-0 bottom-0 w-px border-l border-dashed border-outline" />
              <div className="absolute top-[40%] left-0 right-0 h-px border-t border-dashed border-outline" />
              <div className="absolute left-[45%] top-[40%] bg-surface border border-outline text-on-surface font-data-mono text-[10px] px-1 py-0.5 rounded -translate-x-1/2 -translate-y-full mb-1">
                184.22
              </div>
            </div>
          </div>
        </div>

        {/* Technical indicators */}
        <div className="grid grid-cols-3 gap-unit md:gap-gutter">
          <div className="bg-surface-container border border-outline-variant rounded p-3">
            <div className="text-body-sm text-on-surface-variant mb-1">RSI (14)</div>
            <div className="font-data-mono text-on-surface text-lg">
              68.4 <span className="text-secondary text-xs">Neutral</span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded p-3">
            <div className="text-body-sm text-on-surface-variant mb-1">MACD</div>
            <div className="font-data-mono text-secondary text-lg">
              +1.24 <span className="text-xs">Bullish</span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded p-3">
            <div className="text-body-sm text-on-surface-variant mb-1">Vol (20d)</div>
            <div className="font-data-mono text-on-surface text-lg">
              24.5% <span className="text-error text-xs">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="xl:col-span-4 flex flex-col gap-unit md:gap-gutter">
        {/* Order Book */}
        <div className="bg-surface-container border border-outline-variant rounded flex flex-col min-h-[300px]">
          <div className="p-3 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-[14px] font-semibold text-on-surface">Order Book</h3>
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 relative">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-surface-container z-10">
                <tr>
                  <th className="text-label-uppercase text-[10px] text-on-surface-variant pb-2 font-normal">
                    Size
                  </th>
                  <th className="text-label-uppercase text-[10px] text-on-surface-variant pb-2 font-normal text-right">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-[12px]">
                {ORDER_ASKS.map((row) => (
                  <OrderBookRow key={row.price} {...row} side="ask" />
                ))}
                <tr>
                  <td
                    colSpan={2}
                    className="py-2 text-center text-on-surface-variant text-[10px] border-y border-outline-variant bg-surface-container-highest"
                  >
                    Spread: 0.05
                  </td>
                </tr>
                {ORDER_BIDS.map((row) => (
                  <OrderBookRow key={row.price} {...row} side="bid" />
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-outline-variant flex gap-2">
            <button className="flex-1 bg-error-container/20 text-error border border-error/50 hover:bg-error-container/40 text-label-uppercase text-[11px] py-1.5 rounded transition-colors">
              Sell (Short)
            </button>
            <button className="flex-1 bg-secondary-container/20 text-secondary border border-secondary/50 hover:bg-secondary-container/40 text-label-uppercase text-[11px] py-1.5 rounded transition-colors">
              Buy (Long)
            </button>
          </div>
        </div>

        {/* Smart Alerts */}
        <div className="bg-surface-container border-t-2 border-t-primary border-x border-b border-outline-variant rounded flex flex-col flex-1 min-h-[300px] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="p-3 border-b border-outline-variant flex justify-between items-center relative z-10">
            <h3 className="text-[14px] font-semibold text-primary flex items-center gap-2">
              <MaterialIcon name="psychology" size={16} />
              Smart Alerts
            </h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <MaterialIcon name="filter_list" size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 relative z-10">
            {ALERTS.map((alert) => (
              <div
                key={alert.tag}
                className="bg-surface-container-highest p-3 rounded border border-outline-variant"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-label-uppercase ${alert.tagClass}`}>
                    {alert.tag}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-data-mono">{alert.time}</span>
                </div>
                <p className="text-[12px] text-on-surface leading-snug">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
