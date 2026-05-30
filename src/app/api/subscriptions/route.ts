import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: (session.user as any).id },
  });

  return NextResponse.json(sub);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, paymentRef, platform } = await req.json();

  const planConfig = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
  if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const endDate = new Date();
  if (plan === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const userId = (session.user as any).id;

  const [subscription] = await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      update: { plan, status: "ACTIVE", endDate, price: planConfig.price, paymentRef, platform },
      create: { userId, plan, status: "ACTIVE", endDate, price: planConfig.price, paymentRef, platform },
    }),
    prisma.user.update({ where: { id: userId }, data: { role: "PAID_SUBSCRIBER" } }),
  ]);

  return NextResponse.json(subscription, { status: 201 });
}
