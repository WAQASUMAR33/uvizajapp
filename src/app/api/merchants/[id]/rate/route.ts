import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/merchants/:id/rate
//
// Submits or updates a customer's rating for a merchant.
// One rating per customer per merchant — re-submitting updates the existing one.
//
// ── Request body ─────────────────────────────────────────────────────────────
// {
//   "customerId": 123,        // required
//   "rating":     4,          // required — integer 1–5
//   "review":     "Great!"    // optional
// }
//
// ── Success response (200) ────────────────────────────────────────────────────
// {
//   "id":          1,
//   "customerId":  123,
//   "merchantId":  7,
//   "rating":      4,
//   "review":      "Great!",
//   "avgRating":   4.2,
//   "ratingCount": 15
// }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const merchantId = parseInt(id);

  if (isNaN(merchantId)) {
    return NextResponse.json({ error: "Invalid merchant id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { customerId, rating, review } = body ?? {};

  if (!customerId || isNaN(parseInt(customerId))) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "rating must be an integer between 1 and 5" }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, select: { id: true } });
  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  // Upsert the rating — one per customer per merchant
  const ratingRecord = await prisma.merchantRating.upsert({
    where:  { customerId_merchantId: { customerId: parseInt(customerId), merchantId } },
    update: { rating, review: review ?? null },
    create: { customerId: parseInt(customerId), merchantId, rating, review: review ?? null },
  });

  // Recompute avg and count, then persist back to Merchant for fast reads
  const agg = await prisma.merchantRating.aggregate({
    where:  { merchantId },
    _avg:   { rating: true },
    _count: { rating: true },
  });

  const avgRating   = Math.round((agg._avg.rating ?? 0) * 10) / 10;
  const ratingCount = agg._count.rating;

  await prisma.merchant.update({
    where: { id: merchantId },
    data:  { avgRating, ratingCount },
  });

  return NextResponse.json({ ...ratingRecord, avgRating, ratingCount });
}

