import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAuthorized(session: any) {
  const role = (session?.user as any)?.role;
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

// GET /api/promocodes — list all promo codes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";

    let rows: any[] = [];
    if (search) {
      rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM PromoCode WHERE code LIKE ? ORDER BY createdAt DESC`,
        `%${search}%`
      );
    } else {
      rows = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM PromoCode ORDER BY createdAt DESC`
      );
    }

    const promoCodes = rows.map((r) => ({
      ...r,
      id: Number(r.id),
      discountValue: Number(r.discountValue),
      minOrderAmount: Number(r.minOrderAmount || 0),
      usedCount: Number(r.usedCount || 0),
      isActive: Boolean(r.isActive),
    }));

    return NextResponse.json({ promoCodes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch promo codes" }, { status: 500 });
  }
}

// POST /api/promocodes — create new promo code
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const {
      code,
      titleEn,
      titleHr,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      isActive,
    } = body ?? {};

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Promo code string is required" }, { status: 400 });
    }

    if (typeof discountValue !== "number" || discountValue <= 0) {
      return NextResponse.json({ error: "Discount value must be a positive number" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await prisma.$queryRawUnsafe<any[]>(
      "SELECT id FROM PromoCode WHERE code = ? LIMIT 1",
      cleanCode
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: `Promo code "${cleanCode}" already exists` }, { status: 409 });
    }

    const typeStr = (discountType || "PERCENTAGE").toUpperCase();
    const valNum = Number(discountValue);
    const vFrom = validFrom ? new Date(validFrom) : new Date();
    const vUntil = validUntil ? new Date(validUntil) : null;
    const activeVal = isActive !== undefined ? (isActive ? 1 : 0) : 1;

    await prisma.$executeRawUnsafe(
      `INSERT INTO PromoCode (code, titleEn, titleHr, discountType, discountValue, minOrderAmount, usedCount, validFrom, validUntil, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, NOW(), NOW())`,
      cleanCode,
      titleEn || null,
      titleHr || null,
      typeStr,
      valNum,
      vFrom,
      vUntil,
      activeVal
    );

    const created = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM PromoCode WHERE code = ? LIMIT 1",
      cleanCode
    );

    const result = created[0]
      ? {
          ...created[0],
          id: Number(created[0].id),
          discountValue: Number(created[0].discountValue),
          minOrderAmount: Number(created[0].minOrderAmount || 0),
          usedCount: Number(created[0].usedCount || 0),
          isActive: Boolean(created[0].isActive),
        }
      : {};

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create promo code" }, { status: 500 });
  }
}
