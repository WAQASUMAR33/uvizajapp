import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalUsers,
    totalMerchants,
    totalOffers,
    totalRedemptions,
    activeSubscriptions,
    recentRedemptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.redemption.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.redemption.findMany({
      take: 5,
      orderBy: { redeemedAt: "desc" },
      include: {
        customer: { select: { fullname: true, email: true } },
        merchant: { select: { nameEn: true, nameHr: true } },
        offer: { select: { titleEn: true, titleHr: true } },
      },
    }),
  ]);

  const totalSavings = await prisma.redemption.aggregate({ _sum: { savings: true } });

  return NextResponse.json({
    totalUsers,
    totalMerchants,
    totalOffers,
    totalRedemptions,
    activeSubscriptions,
    totalSavings: totalSavings._sum.savings ?? 0,
    recentRedemptions,
  });
}
