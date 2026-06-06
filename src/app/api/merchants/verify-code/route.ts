import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";

// POST /api/merchants/verify-code
//
// Verifies that a merchant code matches the given merchant (and that the
// merchant is active), returning the merchant's details when it does.
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "merchantId": 7, "merchantCode": "AB12" }
//
// ── Success response (200) — code matches ────────────────────────────────────
// {
//   "status": "valid",
//   "merchant": {
//     "id": 7, "merchantCode": "AB12", "name": "Bloom Café", "category": "CAFES",
//     "description": "...", "address": "...", "city": "...", "images": ["https://..."],
//     "avgRating": 4.2, "ratingCount": 15, "savingsEstimate": 14, "isActive": true
//   }
// }
//
// ── Code doesn't match / merchant not found / inactive (200) ─────────────────
// { "status": "invalid", "error": "Invalid merchant code" }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const merchantId   = body?.merchantId;
  const merchantCode = typeof body?.merchantCode === "string" ? body.merchantCode.trim() : "";

  if (!merchantId || isNaN(parseInt(merchantId))) {
    return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
  }
  if (!merchantCode) {
    return NextResponse.json({ error: "merchantCode is required" }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: parseInt(merchantId) },
    select: {
      id: true, merchantCode: true, name: true, description: true, category: true,
      address: true, city: true, latitude: true, longitude: true, phone: true,
      website: true, images: true, isActive: true, savingsEstimate: true,
      avgRating: true, ratingCount: true,
    },
  });

  if (!merchant || !merchant.isActive || merchant.merchantCode !== merchantCode) {
    return NextResponse.json({ status: "invalid", error: "Invalid merchant code" });
  }

  return NextResponse.json({
    status: "valid",
    merchant: { ...merchant, images: getImageArray(merchant.images).map(toImageUrl) },
  });
}
