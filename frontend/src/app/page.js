import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-outline-variant px-margin-desktop py-4">
        <div className="max-w-[var(--spacing-container-max)] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center border border-outline-variant">
              <MaterialIcon name="blur_on" className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-headline-md font-bold text-on-surface">AlphaEdge Capital</h1>
              <p className="text-label-uppercase text-on-surface-variant">Institutional Terminal</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="text-body-md text-on-surface-variant hover:text-primary px-4 py-2 rounded border border-outline-variant hover:border-outline transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-body-md bg-secondary-container text-on-secondary-container px-4 py-2 rounded text-label-uppercase hover:opacity-90 transition-opacity"
            >
              Access Terminal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[var(--spacing-container-max)] mx-auto px-margin-desktop py-16">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg font-bold text-on-surface mb-4">
            Institutional Trading
            <span className="text-secondary"> Intelligence</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Multi-source market aggregation with reinforcement learning for intelligent investment decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-gutter mb-16">
          {[
            { icon: "dashboard", title: "Global Portfolio Command", desc: "Real-time AUM tracking, sector exposure, and equity book management." },
            { icon: "psychology", title: "Reinforcement Learning Engine", desc: "Self-training RL agent with alpha signals and self-correction logs." },
            { icon: "monitoring", title: "Live Market Terminal", desc: "Order books, smart alerts, and technical indicators in real time." },
          ].map((card) => (
            <div key={card.title} className="bg-surface-container rounded-lg border border-outline-variant p-6 hover:bg-surface-container-highest transition-colors">
              <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center mb-3">
                <MaterialIcon name={card.icon} size={20} className="text-secondary" />
              </div>
              <h3 className="text-body-md font-semibold text-on-surface mb-2">{card.title}</h3>
              <p className="text-body-sm text-on-surface-variant">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-container rounded-lg border border-outline-variant p-8">
          <h3 className="text-headline-md font-semibold text-on-surface mb-4">System Architecture</h3>
          <div className="grid md:grid-cols-4 gap-gutter text-center text-body-sm">
            {[
              { label: "Data Layer", items: "4 Sources\nDeduplication\nUnified Format" },
              { label: "Processing", items: "Weighted Median\nRedis Cache\nRate Limiting" },
              { label: "AI Engine", items: "RL Agent\nSelf-Training\nLive Predictions" },
              { label: "Presentation", items: "Real-Time Charts\nMarket Monitor\nPortfolio View" },
            ].map((col) => (
              <div key={col.label} className="bg-background rounded border border-outline-variant p-4">
                <div className="text-secondary font-semibold mb-2">{col.label}</div>
                <div className="text-on-surface-variant whitespace-pre-line">{col.items}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
