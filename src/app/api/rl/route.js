import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RLAgent } from "@/lib/rl-agent";
import { marketAggregator } from "@/lib/market-aggregator";

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "status";
  const symbol = searchParams.get("symbol") || "AAPL";

  const agent = new RLAgent(session.user.id);
  await agent.initialize();

  switch (action) {
    case "predict": {
      const marketData = await marketAggregator.aggregate(symbol);
      const prediction = await agent.predict(marketData);
      return NextResponse.json(prediction);
    }

    case "train": {
      const symbols = await marketAggregator.getAvailableSymbols();
      const defaultSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "SPY"];
      const results = await agent.selfTrain(symbols.length > 0 ? symbols : defaultSymbols, 5);
      return NextResponse.json({ results, summary: results[results.length - 1] || null });
    }

    case "train-full": {
      const symbols = await marketAggregator.getAvailableSymbols();
      const defaultSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "SPY"];
      const results = await agent.selfTrain(symbols.length > 0 ? symbols : defaultSymbols, 50);
      const avgAccuracy = results.reduce((s, r) => s + r.accuracy, 0) / Math.max(results.length, 1);
      const totalReward = results.reduce((s, r) => s + r.reward, 0);
      return NextResponse.json({
        episodes: results.length,
        avgAccuracy: Number(avgAccuracy.toFixed(4)),
        totalReward: Number(totalReward.toFixed(4)),
        finalExplorationRate: agent.explorationRate,
      });
    }

    case "history": {
      const predictions = await prisma.prediction.findMany({
        where: { agentId: agent.agentId },
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      return NextResponse.json(predictions);
    }

    default: {
      return NextResponse.json({
        agentId: agent.agentId,
        status: "active",
        episodes: agent.episodeCount,
        accuracy: 0,
        explorationRate: agent.explorationRate,
        learningRate: agent.learningRate,
      });
    }
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, symbol, marketData, actualReturn } = await req.json();
  const agent = new RLAgent(session.user.id);
  await agent.initialize();

  if (action === "train-step" && marketData && actualReturn !== undefined) {
    const result = await agent.train(marketData, actualReturn);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
