import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/merchants
// Query params:
//   category   – filter by MerchantCategory enum value
//   search     – partial name match (case-insensitive)
//   page       – page number (default 1)
//   limit      – results per page (default 20)
//   all=true   – skip isActive filter (returns active + inactive merchants)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category  = searchParams.get("category");
  const search    = searchParams.get("search");
  const all       = searchParams.get("all") === "true";
  const page      = parseInt(searchParams.get("page")  ?? "1");
  const limit     = parseInt(searchParams.get("limit") ?? "20");
  const skip      = (page - 1) * limit;

  const where: Record<string, unknown> = all ? {} : { isActive: true };
  if (category) where.category = category;
  if (search)   where.name     = { contains: search };

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      select: {
        id:              true,
        merchantCode:    true,
        name:            true,
        description:     true,
        category:        true,
        address:         true,
        city:            true,
        latitude:        true,
        longitude:       true,
        phone:           true,
        website:         true,
        images:          true,
        isActive:        true,
        savingsEstimate: true,
        avgRating:       true,
        ratingCount:     true,
        createdAt:       true,
        updatedAt:       true,
        offers: {
          where:   { isActive: true },
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
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take:  limit,
    }),
    prisma.merchant.count({ where }),
  ]);

  // Attach discountValue to each offer via raw SQL
  const offerIds = merchants.flatMap((m) => m.offers.map((o) => o.id));
  let dvMap: Record<number, number | null> = {};
  if (offerIds.length) {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, discountValue FROM Offer WHERE id IN (${offerIds.join(",")})`
    );
    for (const r of rows) dvMap[r.id] = r.discountValue ?? null;
  }

  const enriched = merchants.map((m) => ({
    ...m,
    offers: m.offers.map((o) => ({ ...o, discountValue: dvMap[o.id] ?? null })),
  }));

  return NextResponse.json({ merchants: enriched, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id: _id, createdAt: _c, updatedAt: _u, offers: _o, redemptions: _r, ratings: _ra, ...data } = body;
    const merchant = await prisma.merchant.create({ data });
    return NextResponse.json(merchant, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create merchant" }, { status: 500 });
  }
}
