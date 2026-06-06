import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getImageArray } from "@/lib/utils";
import { toImageUrl } from "@/lib/images";

// POST /api/merchants/verify-code
//
// Verifies that a merchant code is valid (exists and belongs to an active
// merchant) and returns the merchant's details.
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "merchantCode": "AB12" }
//
// ── Success response (200) — valid code ──────────────────────────────────────
// {
//   "valid": true,
//   "merchant": {
//     "id": 7, "merchantCode": "AB12", "name": "Bloom Café", "category": "CAFES",
//     "description": "...", "address": "...", "city": "...", "images": ["https://..."],
//     "avgRating": 4.2, "ratingCount": 15, "savingsEstimate": 14, "isActive": true
//   }
// }
//
// ── Not found / inactive (200) ────────────────────────────────────────────────
// { "valid": false, "error": "Invalid merchant code" }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const merchantCode = typeof body?.merchantCode === "string" ? body.merchantCode.trim() : "";

  if (!merchantCode) {
    return NextResponse.json({ error: "merchantCode is required" }, { status: 400 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { merchantCode },
    select: {
      id: true, merchantCode: true, name: true, description: true, category: true,
      address: true, city: true, latitude: true, longitude: true, phone: true,
      website: true, images: true, isActive: true, savingsEstimate: true,
      avgRating: true, ratingCount: true,
    },
  });

  if (!merchant || !merchant.isActive) {
    return NextResponse.json({ valid: false, error: "Invalid merchant code" });
  }

  return NextResponse.json({
    valid: true,
    merchant: { ...merchant, images: getImageArray(merchant.images).map(toImageUrl) },
  });
}
