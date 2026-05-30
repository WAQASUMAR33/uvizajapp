import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where = isAdmin ? {} : { userId };

  const [redemptions, total] = await Promise.all([
    prisma.redemption.findMany({
      where,
      include: {
        offer: { select: { id: true, title: true, discount: true } },
        merchant: { select: { id: true, name: true, images: true, category: true } },
        user: { select: { id: true, email: true, name: true } },
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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "PAID_SUBSCRIBER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Subscription required to redeem offers" }, { status: 403 });
  }

  const { offerId } = await req.json();
  if (!offerId) return NextResponse.json({ error: "offerId required" }, { status: 400 });

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { merchant: true },
  });
  if (!offer || !offer.isActive) {
    return NextResponse.json({ error: "Offer not available" }, { status: 404 });
  }

  const redemption = await prisma.redemption.create({
    data: {
      userId: (session.user as any).id,
      offerId,
      merchantId: offer.merchantId,
      savings: offer.merchant.savingsEstimate,
    },
    include: {
      offer: true,
      merchant: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(redemption, { status: 201 });
}
