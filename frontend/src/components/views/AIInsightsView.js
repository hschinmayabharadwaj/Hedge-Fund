"use client";

import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { downloadJsonFile } from "@/lib/download";
import {
  Stagger,
  StaggerItem,
  FadeIn,
  MotionButton,
  TableRow,
  AnimatedProgress,
  PulseDot,
  motion,
  useReducedMotion,
} from "@/components/motion";

const NEURAL_VIZ_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZVm_0WpDqU68KG9aSqda37CBmyxZNyw3Uv8J8_yGO8FXY9SJ48d48Y04hLefsRKheNwOI8yrCaZ5-TMPGFd5EHAyBYZA1dV22sIdsMkCJcdl-3wgAaDjbOT_26gWFHqw4aOvuZY_-fhei4acOW6Qir7ZHHN-08cv2bnMCJYmVj-9VjDzU8MqGfynPQVSukPX2L9XYlhrWelskqazykNzPV_n0IjUTJ7KjG-smWnexT_ztJmT_Aqawsw";

const SENTIMENT = [
  { sector: "Tech Sector (US)", score: 0.82, type: "positive" },
  { sector: "Eurozone Mfg", score: -0.45, type: "negative" },
  { sector: "Energy Markets", score: 0.12, type: "neutral" },
];

const SIGNALS = [
  { id: "EQ-NVDA", direction: "STRONG BUY", badge: "buy", conf: "98.4", horizon: "T+5 Days", alpha: "+2.45%", positive: true },
  { id: "FX-EURUSD", direction: "SELL", badge: "sell", conf: "87.1", horizon: "Intraday", alpha: "-0.85%", positive: false },
  { id: "CR-BTC", direction: "BUY", badge: "buy", conf: "82.9", horizon: "T+14 Days", alpha: "+5.10%", positive: true },
  { id: "EQ-TSLA", direction: "STRONG SELL", badge: "sell", conf: "91.2", horizon: "T+2 Days", alpha: "-3.20%", positive: false },
  { id: "FI-US10Y", direction: "HOLD", badge: "hold", conf: "65.0", horizon: "T+30 Days", alpha: "0.00%", positive: null },
];

const LOG_ENTRIES = [
  { time: "14:02:11", tag: "PENALTY", tagClass: "text-primary", msg: "Overfit detected in Layer 4 (Momentum factors). Adjusting dropout rate to 0.15." },
  { time: "14:02:15", tag: "REWARD", tagClass: "text-secondary", msg: "Successful prediction on EQ-AAPL volatility spike. Weighting updated +0.02." },
  { time: "14:02:18", tag: "INFO", tagClass: "text-outline-variant", msg: "Ingesting macro CPI data. Re-evaluating fixed income risk metrics." },
  { time: "14:02:22", tag: "CORRECT", tagClass: "text-error", msg: "False positive in sentiment analysis (sarcasm failure). Pruning pathway node A2-B4." },
  { time: "14:02:29", tag: "OPTIMIZE", tagClass: "text-primary", msg: "Convergence reached on subset Delta. Freezing weights for next 100 epochs." },
  { time: "14:02:35", tag: "INFO", tagClass: "text-outline-variant", msg: "Waiting for next data batch..." },
];

const BADGE_STYLES = {
  buy: "bg-secondary/10 text-secondary border border-secondary/20",
  sell: "bg-error/10 text-error border border-error/20",
  hold: "bg-surface-variant text-on-surface border border-outline-variant",
};

function SentimentBar({ item }) {
  const width = `${Math.abs(item.score) * 100}%`;
  if (item.type === "negative") {
    return (
      <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden flex justify-end">
        <AnimatedProgress width={width} className="bg-error rounded-full" />
      </div>
    );
  }
  if (item.type === "neutral") {
    return (
      <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden flex">
        <AnimatedProgress width="56%" className="bg-outline-variant rounded-full" />
      </div>
    );
  }
  return (
    <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden flex">
      <AnimatedProgress width={width} className="bg-secondary rounded-full" />
    </div>
  );
}

function scoreColor(item) {
  if (item.type === "positive") return "text-secondary";
  if (item.type === "negative") return "text-error";
  return "text-on-surface-variant";
}

export default function AIInsightsView() {
  const reduced = useReducedMotion();

  const handleModelParams = () => {
    window.alert("Model parameter controls are available in the next engine release.");
  };

  const handleExportState = () => {
    downloadJsonFile("ai-engine-state.json", {
      sentiment: SENTIMENT,
      signals: SIGNALS,
      logEntries: LOG_ENTRIES,
    });
  };

  return (
    <div>
      <FadeIn className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PulseDot className="w-2 h-2 bg-secondary" />
            <span className="font-data-mono text-body-sm text-secondary">
              ENGINE STATUS: ONLINE (ITERATION 4.2.9)
            </span>
          </div>
          <h2 className="text-headline-lg text-on-surface font-bold">
            Reinforcement Learning Engine
          </h2>
        </div>
        <div className="flex gap-2">
          <MotionButton
            type="button"
            onClick={handleModelParams}
            className="px-3 py-1.5 bg-surface-container border border-outline-variant text-on-surface text-label-uppercase rounded hover:bg-surface-variant transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="tune" size={16} />
            Model Params
          </MotionButton>
          <MotionButton
            type="button"
            onClick={handleExportState}
            className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-label-uppercase rounded hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="download" size={16} />
            Export State
          </MotionButton>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-12 gap-gutter">
        <StaggerItem className="col-span-12 lg:col-span-3">
        <div className="bg-surface-container rounded-lg border-t-2 border-t-secondary border-x border-b border-outline-variant p-4 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-label-uppercase text-on-surface-variant">Model Confidence</h3>
            <MaterialIcon name="verified_user" size={20} className="text-secondary" />
          </div>
          <div className="text-center py-4">
            <div className="font-data-mono text-[48px] leading-none text-on-surface tracking-tighter">
              94.2<span className="text-headline-md text-on-surface-variant">%</span>
            </div>
            <p className="text-body-sm text-secondary mt-2 flex items-center justify-center gap-1">
              <MaterialIcon name="trending_up" size={14} />
              +1.4% vs prev epoch
            </p>
          </div>
          <div className="w-full h-1 bg-surface-variant rounded-full mt-4 overflow-hidden">
            <AnimatedProgress width="94.2%" className="bg-secondary" />
          </div>
        </div>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-5">
        <div className="bg-surface-container rounded-lg border border-outline-variant p-0 relative overflow-hidden flex flex-col min-h-[200px]">
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-label-uppercase text-on-surface drop-shadow-md">Current Focus Nodes</h3>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <span className="px-2 py-0.5 bg-surface/80 border border-outline-variant text-on-surface font-data-mono text-[10px] rounded backdrop-blur-sm">
              DEPTH: L4
            </span>
            <span className="px-2 py-0.5 bg-surface/80 border border-outline-variant text-secondary font-data-mono text-[10px] rounded backdrop-blur-sm">
              ACT: ReLu
            </span>
          </div>
          <div
            className="w-full h-full min-h-[200px] bg-cover bg-center"
            style={{ backgroundImage: `url('${NEURAL_VIZ_URL}')` }}
          />
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-surface-container to-transparent h-12" />
        </div>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-4">
        <div className="bg-surface-container rounded-lg border border-outline-variant p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-label-uppercase text-on-surface-variant">Global News Sentiment</h3>
            <MaterialIcon name="public" size={20} className="text-primary" />
          </div>
          <div className="flex-1 flex flex-col gap-3 justify-center">
            {SENTIMENT.map((s) => (
              <div key={s.sector}>
                <div className="flex justify-between font-data-mono text-body-sm mb-1">
                  <span className="text-on-surface">{s.sector}</span>
                  <span className={scoreColor(s)}>
                    {s.score > 0 ? "+" : ""}
                    {s.score.toFixed(2)}
                  </span>
                </div>
                <SentimentBar item={s} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/50 text-right">
            <span className="font-data-mono text-[10px] text-on-surface-variant">
              Processed: 14,204 feeds/s
            </span>
          </div>
        </div>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-8">
        <div className="bg-surface-container rounded-lg border-t-2 border-t-primary border-x border-b border-outline-variant flex flex-col h-[320px]">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="text-label-uppercase text-on-surface flex items-center gap-2">
              <MaterialIcon name="online_prediction" size={18} />
              Active Alpha Signals
            </h3>
            <span className="font-data-mono text-body-sm text-on-surface-variant border border-outline-variant px-2 py-0.5 rounded bg-surface">
              Top N=5
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant z-10">
                <tr>
                  {["Asset ID", "Signal Direction", "Conf %", "Time Horizon", "Proj Alpha"].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2 px-4 text-label-uppercase text-[10px] text-on-surface-variant font-medium ${
                        i === 2 || i === 4 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-data-mono text-body-sm text-on-surface">
                {SIGNALS.map((s, idx) => (
                  <TableRow
                    key={s.id}
                    index={idx}
                    className={`transition-colors ${
                      idx < SIGNALS.length - 1 ? "border-b border-outline-variant/30" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4">{s.id}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${BADGE_STYLES[s.badge]}`}>
                        {s.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">{s.conf}</td>
                    <td className="py-2.5 px-4 text-on-surface-variant">{s.horizon}</td>
                    <td
                      className={`py-2.5 px-4 text-right ${
                        s.positive === true
                          ? "text-secondary"
                          : s.positive === false
                            ? "text-error"
                            : "text-on-surface-variant"
                      }`}
                    >
                      {s.alpha}
                    </td>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </StaggerItem>

        <StaggerItem className="col-span-12 lg:col-span-4">
        <div className="bg-[#0a0f18] rounded-lg border border-outline-variant p-4 flex flex-col h-[320px] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-label-uppercase text-on-surface-variant flex items-center gap-2">
              <MaterialIcon name="terminal" size={16} />
              RL Self-Correction Log
            </h3>
            <PulseDot className="w-2 h-2 bg-secondary" />
          </div>
          <div className="flex-1 overflow-y-auto font-data-mono text-[11px] leading-relaxed text-on-surface-variant space-y-2 pr-2">
            {LOG_ENTRIES.map((entry, i) =>
              reduced ? (
                <div key={i} className="flex gap-2">
                  <span className="text-outline flex-shrink-0">{entry.time}</span>
                  <span className={`flex-shrink-0 ${entry.tagClass}`}>[{entry.tag}]</span>
                  <span>{entry.msg}</span>
                </div>
              ) : (
                <motion.div
                  key={i}
                  className="flex gap-2"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
                >
                  <span className="text-outline flex-shrink-0">{entry.time}</span>
                  <span className={`flex-shrink-0 ${entry.tagClass}`}>[{entry.tag}]</span>
                  <span>{entry.msg}</span>
                </motion.div>
              )
            )}
          </div>
        </div>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
