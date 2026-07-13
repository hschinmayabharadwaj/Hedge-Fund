// NOTE: This API route is currently unused in the frontend.
// It was created for agent management but is not yet integrated.
// Consider removing or integrating this route in the future.

// NOTE: This API route is currently unused in the frontend.
// It was created for agent management but is not yet integrated.
// Consider removing or integrating this route in the future.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = await getPrisma();
  const agents = await prisma.agentConfig.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      accuracy: true,
      lastTraining: true,
      createdAt: true,
      hyperParams: true,
      _count: { select: { predictions: true } },
    },
  });

  return NextResponse.json(agents);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, hyperParams } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Agent name required" }, { status: 400 });
  }

  const prisma = await getPrisma();
  const existing = await prisma.agentConfig.findFirst({
    where: { userId: session.user.id, name },
  });
  if (existing) {
    return NextResponse.json({ error: "Agent already exists" }, { status: 409 });
  }

  const agent = await prisma.agentConfig.create({
    data: {
      userId: session.user.id,
      name,
      hyperParams: hyperParams || {
        learningRate: 0.01,
        discountFactor: 0.95,
        explorationRate: 0.1,
      },
      modelState: {
        weights: null,
        episodeCount: 0,
        totalReward: 0,
      },
    },
  });

  return NextResponse.json(agent, { status: 201 });
}
