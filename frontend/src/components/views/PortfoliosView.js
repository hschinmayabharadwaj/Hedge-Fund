"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  Stagger,
  StaggerItem,
  FadeIn,
  MotionButton,
  TableRow,
  AnimatedProgress,
} from "@/components/motion";
import { motion, useReducedMotion } from "framer-motion";

const POSITIONS = [
  { asset: "AAPL", dot: "bg-secondary", classLabel: "Equity", weight: "8.4%", value: "$104.2M", change: "+1.24%", positive: true, trendIcon: "show_chart" },
  { asset: "MSFT", dot: "bg-secondary", classLabel: "Equity", weight: "7.1%", value: "$88.0M", change: "+0.85%", positive: true, trendIcon: "show_chart" },
  { asset: "US10Y", dot: "bg-primary", classLabel: "Fixed Inc", weight: "12.5%", value: "$155.0M", change: "-0.12%", positive: false, trendIcon: "waterfall_chart" },
  { asset: "BTC", dot: "bg-error", classLabel: "Crypto", weight: "4.2%", value: "$52.1M", change: "+4.50%", positive: true, trendIcon: "show_chart" },
];

const YTD_BARS = [
  { height: "20%", positive: true },
  { height: "25%", positive: true },
  { height: "40%", positive: true },
  { height: "15%", positive: false },
  { height: "35%", positive: true },
  { height: "50%", positive: true },
  { height: "65%", positive: true },
  { height: "80%", positive: true },
];

const ALLOCATION_LEGEND = [
  { color: "bg-secondary", label: "Equities (45%)" },
  { color: "bg-primary", label: "Fixed Inc (30%)" },
  { color: "bg-error", label: "Alt/Crypto (15%)" },
  { color: "bg-on-background", label: "Cash (10%)" },
];

export default function PortfoliosView() {
  const reduced = useReducedMotion();

  return (
    <div>
      <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1 font-bold">
            Global Alpha Fund IV
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            AUM: $1.24B USD | Last updated: 09:41:22 EST
          </p>
        </div>
        <div className="flex gap-2">
          <MotionButton className="bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded text-label-uppercase hover:bg-surface-container-high transition-colors">
            Export Report
          </MotionButton>
          <MotionButton className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded text-label-uppercase hover:bg-secondary hover:text-on-secondary transition-colors flex items-center gap-2">
            <MaterialIcon name="auto_awesome" size={16} />
            AI Sim
          </MotionButton>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-6">
        <StaggerItem className="col-span-1 md:col-span-4">
        <div className="bg-surface-container border border-outline-variant rounded-lg p-4 flex flex-col h-full">
          <h3 className="text-body-md font-semibold text-on-surface mb-4">Asset Allocation</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <div
              className="w-40 h-40 rounded-full border-[16px] border-surface-container-highest relative flex items-center justify-center"
              style={{
                background:
                  "conic-gradient(from 0deg, #4edea3 0% 45%, #bec6e0 45% 75%, #ffb4ab 75% 90%, #d4e4fa 90% 100%)",
              }}
            >
              <div className="w-24 h-24 bg-surface-container rounded-full flex flex-col items-center justify-center">
                <span className="font-data-mono text-on-surface">100%</span>
                <span className="text-body-sm text-on-surface-variant">Deployed</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {ALLOCATION_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-body-sm text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        </StaggerItem>

        <StaggerItem className="col-span-1 md:col-span-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-body-sm text-on-surface-variant">Value at Risk (VaR 95%)</h3>
                <MaterialIcon name="trending_down" size={20} className="text-outline" />
              </div>
              <div className="font-data-mono text-[24px] font-bold text-on-surface mb-1">-$24.8M</div>
              <div className="flex items-center gap-1 text-secondary">
                <MaterialIcon name="arrow_downward" size={14} />
                <span className="font-data-mono">1.2% from 30d avg</span>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <AnimatedProgress width="45%" className="bg-secondary" />
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-body-sm text-on-surface-variant">Sharpe Ratio</h3>
                <MaterialIcon name="psychology" size={20} className="text-primary" />
              </div>
              <div className="font-data-mono text-[24px] font-bold text-on-surface mb-1">1.84</div>
              <div className="flex items-center gap-1 text-secondary">
                <MaterialIcon name="arrow_upward" size={14} />
                <span className="font-data-mono">Top quartile</span>
              </div>
            </div>
            <div className="mt-4 text-primary text-body-sm">
              AI Suggests: Volatility expected to normalize.
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-lg p-4 col-span-1 md:col-span-2">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-body-sm text-on-surface-variant">YTD Performance vs Benchmark</h3>
            </div>
            <div className="h-24 flex items-end gap-1 opacity-80">
              <div className="w-full h-full border-b border-l border-outline-variant relative flex items-end pl-2 gap-1 pb-1">
                {YTD_BARS.map((bar, i) =>
                  reduced ? (
                    <div
                      key={i}
                      className={`flex-1 ${bar.positive ? "bg-secondary" : "bg-error"}`}
                      style={{ height: bar.height }}
                    />
                  ) : (
                    <motion.div
                      key={i}
                      className={`flex-1 ${bar.positive ? "bg-secondary" : "bg-error"}`}
                      initial={{ height: 0 }}
                      animate={{ height: bar.height }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )
                )}
                <div className="absolute bottom-4 left-0 w-full h-px border-t border-dashed border-primary" />
              </div>
            </div>
          </div>
        </div>
        </StaggerItem>
      </Stagger>

      <FadeIn delay={0.15}>
      <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
          <h3 className="text-body-md font-semibold text-on-surface">Top Positions</h3>
          <div className="flex gap-2">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon name="filter_list" size={18} />
            </button>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon name="more_vert" size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant">Asset</th>
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant">Class</th>
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant text-right">Weight</th>
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant text-right">Value (USD)</th>
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant text-right">24h Change</th>
                <th className="py-2 px-4 text-body-sm font-medium text-on-surface-variant text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="font-data-mono">
              {POSITIONS.map((p, idx) => (
                <TableRow
                  key={p.asset}
                  index={idx}
                  className={`transition-colors ${
                    idx < POSITIONS.length - 1 ? "border-b border-outline-variant" : ""
                  }`}
                >
                  <td className="py-2 px-4 text-on-surface">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.dot}`} />
                      {p.asset}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] uppercase">
                      {p.classLabel}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">{p.weight}</td>
                  <td className="py-2 px-4 text-right">{p.value}</td>
                  <td className={`py-2 px-4 text-right ${p.positive ? "text-secondary" : "text-error"}`}>
                    {p.change}
                  </td>
                  <td className={`py-2 px-4 text-center ${p.positive ? "text-secondary" : "text-error"}`}>
                    <MaterialIcon name={p.trendIcon} size={16} />
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </FadeIn>
    </div>
  );
}
