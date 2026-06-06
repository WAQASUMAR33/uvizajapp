import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImageArray } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const merchantId = parseInt(id);

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      offers: {
        where:   { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id:          true,
          title:       true,
          description: true,
          discount:    true,
          offerAmount: true,
          terms:       true,
          validFrom:   true,
          validUntil:  true,
          isActive:    true,
        },
      },
      ratings: {
        select:  { customerId: true, rating: true, review: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take:    20,
      },
    },
  });

  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Attach discountValue to each offer via raw SQL
  const offerIds = merchant.offers.map((o) => o.id);
  let dvMap: Record<number, number | null> = {};
  if (offerIds.length) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, discountValue FROM Offer WHERE id IN (${offerIds.join(",")})`
    );
    for (const r of rows) dvMap[r.id] = r.discountValue ?? null;
  }

  return NextResponse.json({
    ...merchant,
    images: getImageArray(merchant.images),
    offers: merchant.offers.map((o) => ({ ...o, discountValue: dvMap[o.id] ?? null })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { id: _id, createdAt: _c, updatedAt: _u, offers: _o, redemptions: _r, ratings: _ra, ...data } = body;
    const merchant = await prisma.merchant.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json(merchant);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.merchant.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
