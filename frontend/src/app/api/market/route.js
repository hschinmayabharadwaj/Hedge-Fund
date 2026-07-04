import { NextResponse } from "next/server";
import { marketAggregator } from "@/lib/market-aggregator";
import { rateLimit } from "@/lib/rate-limiter";
import { auth } from "@/lib/auth";

const MOCK_SOURCES = [
  { id: "alpha-vantage", data: [
    { symbol: "AAPL", price: 178.50, volume: 45200000, high24h: 180.20, low24h: 177.10, change24h: 1.25, bid: 178.48, ask: 178.52 },
    { symbol: "GOOGL", price: 141.80, volume: 22300000, high24h: 143.50, low24h: 140.90, change24h: -0.45, bid: 141.78, ask: 141.82 },
    { symbol: "MSFT", price: 378.20, volume: 18500000, high24h: 382.10, low24h: 376.80, change24h: 2.10, bid: 378.18, ask: 378.22 },
    { symbol: "AMZN", price: 178.30, volume: 31200000, high24h: 180.50, low24h: 177.20, change24h: 0.85, bid: 178.28, ask: 178.32 },
    { symbol: "TSLA", price: 248.90, volume: 56700000, high24h: 255.30, low24h: 246.10, change24h: -1.65, bid: 248.88, ask: 248.92 },
    { symbol: "SPY", price: 478.50, volume: 42100000, high24h: 481.20, low24h: 476.80, change24h: 0.55, bid: 478.48, ask: 478.52 },
  ]},
  { id: "iex-cloud", data: [
    { symbol: "AAPL", price: 178.48, volume: 44800000, high24h: 180.15, low24h: 177.05, change24h: 1.23, bid: 178.47, ask: 178.53 },
    { symbol: "GOOGL", price: 141.82, volume: 22100000, high24h: 143.48, low24h: 140.88, change24h: -0.44, bid: 141.79, ask: 141.83 },
    { symbol: "MSFT", price: 378.22, volume: 18300000, high24h: 382.05, low24h: 376.75, change24h: 2.08, bid: 378.19, ask: 378.23 },
  ]},
  { id: "polygon", data: [
    { symbol: "AAPL", price: 178.52, volume: 45500000, high24h: 180.25, low24h: 177.15, change24h: 1.26, bid: 178.49, ask: 178.54 },
    { symbol: "GOOGL", price: 141.78, volume: 22500000, high24h: 143.52, low24h: 140.92, change24h: -0.46, bid: 141.76, ask: 141.80 },
  ]},
  { id: "finnhub", data: [
    { symbol: "AAPL", price: 178.46, volume: 45000000, high24h: 180.18, low24h: 177.08, change24h: 1.24, bid: 178.45, ask: 178.51 },
    { symbol: "MSFT", price: 378.18, volume: 18700000, high24h: 382.08, low24h: 376.78, change24h: 2.09, bid: 378.16, ask: 378.20 },
    { symbol: "AMZN", price: 178.28, volume: 31000000, high24h: 180.48, low24h: 177.18, change24h: 0.84, bid: 178.26, ask: 178.30 },
  ]},
];

export async function GET(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimit(`market:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const history = searchParams.get("history");

  for (const source of MOCK_SOURCES) {
    await marketAggregator.ingest(source.id, source.data);
  }

  if (symbol) {
    const result = await marketAggregator.aggregate(symbol.toUpperCase());
    if (!result) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }
    if (history) {
      const hist = await marketAggregator.getHistory(symbol.toUpperCase(), parseInt(history) || 100);
      return NextResponse.json({ ...result, history: hist });
    }
    return NextResponse.json(result);
  }

  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "SPY"];
  const results = [];
  for (const sym of symbols) {
    const data = await marketAggregator.aggregate(sym);
    if (data) results.push(data);
  }

  return NextResponse.json(results);
}
