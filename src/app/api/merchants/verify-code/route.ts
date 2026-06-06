import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/merchants/verify-code
//
// Verifies that a merchant code matches the given merchant (and that the
// merchant is active), returning only a status — no merchant details.
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "merchantId": 7, "merchantCode": "AB12" }
//
// ── Response (200) ───────────────────────────────────────────────────────────
// { "status": "valid" }
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
    select: { merchantCode: true, isActive: true },
  });

  if (!merchant || !merchant.isActive || merchant.merchantCode !== merchantCode) {
    return NextResponse.json({ status: "invalid", error: "Invalid merchant code" });
  }

  return NextResponse.json({ status: "valid" });
}
