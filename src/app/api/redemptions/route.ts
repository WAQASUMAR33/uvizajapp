import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";

const redemptionSelectIncludes = {
  customer: { select: { id: true, fullname: true, email: true, phoneNumber: true, imageUrl: true } },
  merchant: {
    select: {
      id: true, merchantCode: true, name: true, description: true, category: true,
      address: true, city: true, latitude: true, longitude: true, phone: true,
      website: true, images: true, isActive: true, savingsEstimate: true,
      avgRating: true, ratingCount: true,
    },
  },
  offer: {
    select: {
      id: true, title: true, description: true, discount: true, offerAmount: true,
      terms: true, validFrom: true, validUntil: true, isActive: true,
    },
  },
} as const;

// Attach offerAmount/offerDiscount snapshot fields (raw SQL — not yet in generated Prisma client)
async function withSnapshotFields(redemptions: any[]) {
  if (!redemptions.length) return redemptions;
  const ids = redemptions.map((r) => r.id);
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, offerAmount, offerDiscount FROM Redemption WHERE id IN (${ids.join(",")})`
  );
  const map: Record<number, { offerAmount: number | null; offerDiscount: string | null }> = {};
  for (const r of rows) map[r.id] = { offerAmount: r.offerAmount ?? null, offerDiscount: r.offerDiscount ?? null };
  return redemptions.map((r) => ({
    ...r,
    merchant: { ...r.merchant, images: getImageArray(r.merchant?.images ?? null).map(toImageUrl) },
    ...(map[r.id] ?? { offerAmount: null, offerDiscount: null }),
  }));
}

// GET /api/redemptions?customerId=123&merchantId=4&page=1&limit=20
//
// Returns redemption records with full related customer, merchant, and offer data.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const merchantId = searchParams.get("merchantId");
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip  = (page - 1) * limit;

  const where: any = {};
  if (customerId) where.customerId = parseInt(customerId);
  if (merchantId) where.merchantId = parseInt(merchantId);

  const [redemptions, total] = await Promise.all([
    prisma.redemption.findMany({
      where,
      include: redemptionSelectIncludes,
      orderBy: { redeemedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.redemption.count({ where }),
  ]);

  const enriched = await withSnapshotFields(redemptions);

  return NextResponse.json({ redemptions: enriched, total, page, limit });
}

// POST /api/redemptions
//
// Creates a redemption record — requires an active subscription.
// Snapshots the offer's amount, discount label, and the merchant's savings estimate
// at the moment of redemption (these can change later on the offer/merchant).
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "customerId": 123, "offerId": 7 }
//
// ── Success response (201) ───────────────────────────────────────────────────
// Full redemption record including customer, merchant, and offer relations, plus:
// {
//   "customerId":    123,
//   "merchantId":    4,
//   "offerId":       7,
//   "offerAmount":   15.00,
//   "offerDiscount": "20% OFF",
//   "savings":       12.50,
//   "redeemedAt":    "2026-06-06T10:00:00.000Z"
// }
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
        customerId: parseInt(customerId),
        offerId:    offer.id,
        merchantId: offer.merchantId,
        savings:    offer.merchant.savingsEstimate,
      },
    });

    // Snapshot offer amount + discount label via raw SQL (fields not yet in generated client)
    await prisma.$executeRawUnsafe(
      `UPDATE Redemption SET offerAmount = ?, offerDiscount = ? WHERE id = ?`,
      offer.offerAmount ?? null,
      offer.discount ?? null,
      redemption.id
    );

    const full = await prisma.redemption.findUnique({
      where: { id: redemption.id },
      include: redemptionSelectIncludes,
    });

    const [enriched] = await withSnapshotFields([full]);

    return NextResponse.json(enriched, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
