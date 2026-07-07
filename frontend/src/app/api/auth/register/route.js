import { hash } from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = await rateLimit(`register:${ip}`);
    if (!allowed) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const prisma = await getPrisma();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || email.split("@")[0] },
      select: { id: true, email: true, name: true },
    });

    await prisma.portfolio.create({
      data: { userId: user.id, name: "Main Portfolio" },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[Register Error]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
