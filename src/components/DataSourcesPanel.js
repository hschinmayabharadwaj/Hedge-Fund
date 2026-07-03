"use client";

const sources = [
  { id: "alpha-vantage", name: "Alpha Vantage", status: "connected", latency: "45ms", weight: "25%" },
  { id: "iex-cloud", name: "IEX Cloud", status: "connected", latency: "32ms", weight: "25%" },
  { id: "polygon", name: "Polygon.io", status: "connected", latency: "28ms", weight: "25%" },
  { id: "finnhub", name: "Finnhub", status: "connected", latency: "38ms", weight: "25%" },
];

export default function DataSourcesPanel() {
  return (
    <div className="bg-card rounded-lg border border-default p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Data Sources</h3>
      <div className="space-y-2">
        {sources.map((src) => (
          <div key={src.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green rounded-full"></span>
              <span className="text-gray-300">{src.name}</span>
            </div>
            <div className="flex gap-3 text-gray-500">
              <span>{src.latency}</span>
              <span>w: {src.weight}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-default">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Aggregation Method</span>
          <span className="text-gold font-medium">Weighted Median</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Deduplication</span>
          <span className="text-green font-medium">Active</span>
        </div>
      </div>
    </div>
  );
}
