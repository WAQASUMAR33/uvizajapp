import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/types";

// GET /api/subscriptions?customerId=123
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { customerId: parseInt(customerId) },
  });

  return NextResponse.json(sub);
}

// POST /api/subscriptions  — create / renew subscription for a customer
export async function POST(req: NextRequest) {
  try {
    const { customerId, plan, paymentRef, platform } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const planConfig = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const endDate = new Date();
    if (plan === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const id = parseInt(customerId);

    const subscription = await prisma.subscription.upsert({
      where:  { customerId: id },
      update: { plan, status: "ACTIVE", endDate, price: planConfig.price, paymentRef, platform },
      create: { customerId: id, plan, status: "ACTIVE", endDate, price: planConfig.price, paymentRef, platform },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
