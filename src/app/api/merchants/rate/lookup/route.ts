import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/merchants/rate/lookup
//
// Returns the rating a specific customer gave to a specific merchant (if any).
// Useful for pre-filling an "edit my rating" form.
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "customerId": 123, "merchantId": 7 }
//
// ── Success response ─────────────────────────────────────────────────────────
// Rating exists:
// { "id": 1, "customerId": 123, "merchantId": 7, "rating": 4, "review": "...", "createdAt": "...", "updatedAt": "..." }
//
// No rating yet:
// { "rating": null, "review": null }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { customerId, merchantId } = body ?? {};

  if (!customerId || isNaN(parseInt(customerId))) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }
  if (!merchantId || isNaN(parseInt(merchantId))) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }

  const ratingRecord = await prisma.merchantRating.findUnique({
    where: { customerId_merchantId: { customerId: parseInt(customerId), merchantId: parseInt(merchantId) } },
  });

  return NextResponse.json(ratingRecord ?? { rating: null, review: null });
}
