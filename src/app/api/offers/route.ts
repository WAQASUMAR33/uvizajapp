import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId");
  const all = searchParams.get("all") === "true" && !!merchantId;

  const where: any = {};
  if (!all) where.isActive = true;
  if (merchantId) where.merchantId = parseInt(merchantId, 10);

  const offers = await prisma.offer.findMany({
    where,
    include: { merchant: { select: { id: true, nameEn: true, nameHr: true, images: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Attach discountValue from raw query (not yet in Prisma client)
  const ids = offers.map((o) => o.id);
  const raw: any[] = ids.length
    ? await prisma.$queryRawUnsafe(
        `SELECT id, discountValue FROM Offer WHERE id IN (${ids.join(",")})`
      )
    : [];
  const dvMap: Record<number, number | null> = {};
  for (const r of raw) dvMap[r.id] = r.discountValue ?? null;

  return NextResponse.json(offers.map((o) => ({ ...o, discountValue: dvMap[o.id] ?? null })));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { discountValue, id: _id, createdAt: _c, updatedAt: _u, merchant: _m, validFrom: _vf, ...rest } = body;

    if (rest.validUntil) rest.validUntil = new Date(rest.validUntil);
    if (rest.merchantId) rest.merchantId = parseInt(rest.merchantId);

    const offer = await prisma.offer.create({ data: rest });

    // Save discountValue via raw SQL
    if (discountValue != null) {
      await prisma.$executeRawUnsafe(
        `UPDATE Offer SET discountValue = ? WHERE id = ?`,
        discountValue,
        offer.id
      );
    }

    return NextResponse.json({ ...offer, discountValue: discountValue ?? null }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
