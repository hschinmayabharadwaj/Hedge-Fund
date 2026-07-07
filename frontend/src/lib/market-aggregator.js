import { getPrisma } from "./prisma";
import { redis } from "./redis";

const MARKET_SOURCES = [
  { id: "alpha-vantage", name: "Alpha Vantage", weight: 0.25, priority: 1 },
  { id: "iex-cloud", name: "IEX Cloud", weight: 0.25, priority: 2 },
  { id: "polygon", name: "Polygon.io", weight: 0.25, priority: 3 },
  { id: "finnhub", name: "Finnhub", weight: 0.25, priority: 4 },
];

const AGGREGATION_CACHE_KEY = "unified:market:";

function weightedMedian(values) {
  const sorted = [...values].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((sum, v) => sum + v.weight, 0);
  let cumulative = 0;
  for (const item of sorted) {
    cumulative += item.weight;
    if (cumulative >= totalWeight / 2) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

export class MarketAggregator {
  constructor() {
    this.sources = new Map();
  }

  async ingest(sourceId, data) {
    const existing = this.sources.get(sourceId) || [];
    const deduped = data.filter(
      (d) => !existing.some((e) => e.symbol === d.symbol && Math.abs(e.price - d.price) < 0.001)
    );
    this.sources.set(sourceId, [...existing, ...deduped]);

    const prisma = await getPrisma();
    await prisma.marketData.createMany({
      data: deduped.map((d) => ({
        source: sourceId,
        symbol: d.symbol,
        price: d.price,
        volume: d.volume,
        high24h: d.high24h ?? d.price,
        low24h: d.low24h ?? d.price,
        change24h: d.change24h ?? 0,
      })),
      skipDuplicates: true,
    });
  }

  async aggregate(symbol) {
    const cacheKey = `${AGGREGATION_CACHE_KEY}${symbol}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const allPrices = [];
    const allVolumes = [];
    const bids = [];
    const asks = [];
    const sources = [];
    let high24h = 0;
    let low24h = Infinity;
    let weightedChange = 0;

    for (const source of MARKET_SOURCES) {
      const data = this.sources.get(source.id)?.filter((d) => d.symbol === symbol) || [];
      if (data.length === 0) continue;

      const latest = data[data.length - 1];
      allPrices.push({ value: latest.price, weight: source.weight });
      allVolumes.push(latest.volume);
      if (latest.bid) bids.push(latest.bid);
      if (latest.ask) asks.push(latest.ask);
      if (latest.high24h && latest.high24h > high24h) high24h = latest.high24h;
      if (latest.low24h && latest.low24h < low24h) low24h = latest.low24h;
      weightedChange += (latest.change24h ?? 0) * source.weight;
      sources.push(source.name);
    }

    if (allPrices.length === 0) return null;

    const aggregatedPrice = weightedMedian(allPrices);
    const aggregatedVolume = allVolumes.reduce((a, b) => a + b, 0) / allVolumes.length;
    const bid = bids.length > 0 ? bids.reduce((a, b) => a + b, 0) / bids.length : null;
    const ask = asks.length > 0 ? asks.reduce((a, b) => a + b, 0) / asks.length : null;

    const result = {
      symbol,
      price: Number(aggregatedPrice.toFixed(4)),
      volume: Number(aggregatedVolume.toFixed(2)),
      high24h: high24h || aggregatedPrice,
      low24h: low24h === Infinity ? aggregatedPrice : low24h,
      change24h: Number(weightedChange.toFixed(4)),
      bid: bid ? Number(bid.toFixed(4)) : null,
      ask: ask ? Number(ask.toFixed(4)) : null,
      spread: bid && ask ? Number((ask - bid).toFixed(4)) : null,
      timestamp: Date.now(),
      sources,
    };

    await redis.setex(cacheKey, 5, JSON.stringify(result));

    const prisma = await getPrisma();
    await prisma.unifiedFeed.create({
      data: {
        symbol: result.symbol,
        price: result.price,
        volume: result.volume,
        high24h: result.high24h,
        low24h: result.low24h,
        change24h: result.change24h,
        bid: result.bid,
        ask: result.ask,
        spread: result.spread,
      },
    });

    return result;
  }

  async getAvailableSymbols() {
    const prisma = await getPrisma();
    const symbols = await prisma.marketData.findMany({
      select: { symbol: true },
      distinct: ["symbol"],
    });
    return symbols.map((s) => s.symbol);
  }

  async getHistory(symbol, limit = 100) {
    const prisma = await getPrisma();
    const data = await prisma.unifiedFeed.findMany({
      where: { symbol },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    return data.reverse().map((d) => ({
      symbol: d.symbol,
      price: d.price,
      volume: d.volume,
      high24h: d.high24h,
      low24h: d.low24h,
      change24h: d.change24h,
      bid: d.bid,
      ask: d.ask,
      spread: d.spread,
      timestamp: d.timestamp.getTime(),
      sources: ["unified"],
    }));
  }
}

export const marketAggregator = new MarketAggregator();
