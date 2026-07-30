import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function processValidation(code?: string, amount?: number) {
  if (!code || typeof code !== "string" || !code.trim()) {
    return NextResponse.json(
      { valid: false, error: "Promo code is required" },
      { status: 400 }
    );
  }

  const cleanCode = code.trim().toUpperCase();
  const purchaseAmount = typeof amount === "number" && amount > 0 ? amount : 0;

  // Search PromoCode in database using raw SQL
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT * FROM PromoCode WHERE code = ? LIMIT 1",
    cleanCode
  );

  if (!rows || !rows.length) {
    return NextResponse.json(
      { valid: false, error: "Invalid promo code" },
      { status: 404 }
    );
  }

  const promo = rows[0];
  const isActive = Boolean(promo.isActive);
  const discountType = String(promo.discountType || "PERCENTAGE").toUpperCase();
  const discountValue = Number(promo.discountValue);

  // Check 1: Active status
  if (!isActive) {
    return NextResponse.json(
      { valid: false, error: "This promo code is currently inactive" },
      { status: 400 }
    );
  }

  // Check 2: Date validity
  const now = new Date();
  if (promo.validFrom && now < new Date(promo.validFrom)) {
    return NextResponse.json(
      { valid: false, error: "This promo code is not active yet" },
      { status: 400 }
    );
  }

  if (promo.validUntil && now > new Date(promo.validUntil)) {
    return NextResponse.json(
      { valid: false, error: "This promo code has expired" },
      { status: 400 }
    );
  }

  // Calculate Discount
  let discountAmount = 0;
  const isPercentage = discountType === "PERCENTAGE";

  if (isPercentage) {
    discountAmount = (purchaseAmount * discountValue) / 100;
  } else {
    // FIXED AMOUNT DISCOUNT
    discountAmount = purchaseAmount > 0 ? Math.min(discountValue, purchaseAmount) : discountValue;
  }

  const finalAmount = purchaseAmount > 0 ? Math.max(0, purchaseAmount - discountAmount) : 0;

  const discountText = isPercentage
    ? `${discountValue}% off`
    : `€${discountValue.toFixed(2)} off`;

  return NextResponse.json({
    valid: true,
    code: promo.code,
    titleEn: promo.titleEn || promo.code,
    titleHr: promo.titleHr || promo.titleEn || promo.code,
    discountType,
    discountValue,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
    originalAmount: purchaseAmount,
    message: `Promo code applied successfully! (${discountText})`,
  });
}

// GET /api/promocodes/validate?code=SUMMER50&amount=49.99
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || undefined;
    const amountStr = searchParams.get("amount");
    const amount = amountStr ? parseFloat(amountStr) : undefined;

    return await processValidation(code, amount);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: "Failed to validate promo code: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// POST /api/promocodes/validate — Body: { code: "SUMMER50", amount: 49.99 }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { code, amount } = body ?? {};

    return await processValidation(code, typeof amount === "number" ? amount : undefined);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: "Failed to validate promo code: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
