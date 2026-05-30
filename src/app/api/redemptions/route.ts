import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip  = (page - 1) * limit;

  const where: any = {};
  if (customerId) where.customerId = parseInt(customerId);

  const [redemptions, total] = await Promise.all([
    prisma.redemption.findMany({
      where,
      include: {
        customer: { select: { id: true, fullname: true, email: true } },
        offer:    { select: { id: true, title: true, discount: true } },
        merchant: { select: { id: true, name: true, images: true, category: true } },
      },
      orderBy: { redeemedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.redemption.count({ where }),
  ]);

  return NextResponse.json({ redemptions, total, page, limit });
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, offerId } = await req.json();

    if (!customerId || !offerId) {
      return NextResponse.json({ error: "customerId and offerId are required" }, { status: 400 });
    }

    // Verify customer has an active subscription
    const subscription = await prisma.subscription.findUnique({
      where: { customerId: parseInt(customerId) },
    });
    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "Active subscription required to redeem offers" }, { status: 403 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: parseInt(offerId) },
      include: { merchant: true },
    });
    if (!offer || !offer.isActive) {
      return NextResponse.json({ error: "Offer not available" }, { status: 404 });
    }

    const redemption = await prisma.redemption.create({
      data: {
        customerId:  parseInt(customerId),
        offerId:     offer.id,
        merchantId:  offer.merchantId,
        savings:     offer.merchant.savingsEstimate,
      },
      include: {
        offer:    true,
        merchant: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(redemption, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
