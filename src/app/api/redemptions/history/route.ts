import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";

// POST /api/redemptions/history
//
// Returns the full redemption history for a customer.
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "customerId": 6 }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// {
//   "customerId": 6,
//   "total": 3,
//   "redemptions": [
//     {
//       "id": 12,
//       "redeemedAt": "2026-06-07T10:00:00.000Z",
//       "savings": 14,
//       "offerAmount": 15.00,
//       "offerDiscount": "20% OFF",
//       "offer": { "id", "title", "description", "discount", "offerAmount", "validFrom", "validUntil" },
//       "merchant": { "id", "name", "category", "city", "address", "images", "savingsEstimate", ... }
//     },
//     ...
//   ]
// }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const customerId = parseInt(body?.customerId);

  if (isNaN(customerId)) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const redemptions = await prisma.redemption.findMany({
    where: { customerId },
    orderBy: { redeemedAt: "desc" },
    include: {
      offer: {
        select: {
          id: true, title: true, description: true, discount: true,
          offerAmount: true, terms: true, validFrom: true, validUntil: true, isActive: true,
        },
      },
      merchant: {
        select: {
          id: true, merchantCode: true, name: true, category: true,
          address: true, city: true, latitude: true, longitude: true,
          phone: true, website: true, images: true, savingsEstimate: true,
          avgRating: true, ratingCount: true,
        },
      },
    },
  });

  if (!redemptions.length) {
    return NextResponse.json({ customerId, total: 0, redemptions: [] });
  }

  // Fetch snapshot fields (offerAmount, offerDiscount) via raw SQL
  const ids = redemptions.map((r) => r.id);
  const snapshots = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, offerAmount, offerDiscount FROM Redemption WHERE id IN (${ids.join(",")})`
  );
  const snapMap: Record<number, { offerAmount: number | null; offerDiscount: string | null }> = {};
  for (const s of snapshots) {
    snapMap[s.id] = {
      offerAmount:   s.offerAmount  == null ? null : Number(s.offerAmount),
      offerDiscount: s.offerDiscount ?? null,
    };
  }

  const result = redemptions.map((r) => ({
    id:            r.id,
    redeemedAt:    r.redeemedAt,
    savings:       r.savings,
    offerAmount:   snapMap[r.id]?.offerAmount  ?? null,
    offerDiscount: snapMap[r.id]?.offerDiscount ?? null,
    offer:         r.offer,
    merchant: {
      ...r.merchant,
      images: getImageArray(r.merchant?.images ?? null).map(toImageUrl),
    },
  }));

  return NextResponse.json({ customerId, total: result.length, redemptions: result });
}
