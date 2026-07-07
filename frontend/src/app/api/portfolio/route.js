import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = await getPrisma();
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    include: {
      trades: { orderBy: { timestamp: "desc" }, take: 50 },
    },
  });

  const summaries = portfolios.map((p) => {
    const invested = p.trades.reduce((sum, t) => sum + t.total, 0);
    const pnl = p.trades
      .filter((t) => t.type === "SELL")
      .reduce((sum, t) => sum + t.total, 0) -
      p.trades
        .filter((t) => t.type === "BUY")
        .reduce((sum, t) => sum + t.total, 0);

    return {
      id: p.id,
      name: p.name,
      balance: p.balance,
      invested: Number(invested.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: invested > 0 ? Number(((pnl / invested) * 100).toFixed(2)) : 0,
      tradeCount: p.trades.length,
      trades: p.trades,
    };
  });

  return NextResponse.json(summaries);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = await rateLimit(`trade:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many trades" }, { status: 429 });
  }

  const { portfolioId, symbol, type, quantity, price } = await req.json();

  if (!portfolioId || !symbol || !type || !quantity || !price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prisma = await getPrisma();
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: session.user.id },
  });
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const total = quantity * price;

  if (type === "BUY" && total > portfolio.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const trade = await prisma.trade.create({
    data: { portfolioId, symbol: symbol.toUpperCase(), type, quantity, price, total },
  });

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      balance: type === "BUY" ? { decrement: total } : { increment: total },
    },
  });

  return NextResponse.json(trade, { status: 201 });
}
