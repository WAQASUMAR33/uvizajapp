import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { hasPermission } from "@/lib/permissions";

function isAuthorized(session: any) {
  return session && hasPermission(session.user, "offers");
}

// GET /api/promocodes/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const rows = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM PromoCode WHERE id = ? LIMIT 1",
      parseInt(id)
    );

    if (!rows || !rows.length) return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    const r = rows[0];
    return NextResponse.json({
      ...r,
      id: Number(r.id),
      discountValue: Number(r.discountValue),
      minOrderAmount: Number(r.minOrderAmount || 0),
      usedCount: Number(r.usedCount || 0),
      isActive: Boolean(r.isActive),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch promo code" }, { status: 500 });
  }
}

// PUT /api/promocodes/:id — update promo code settings or toggle active status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const promoId = parseInt(id);

    const existing = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM PromoCode WHERE id = ? LIMIT 1",
      promoId
    );
    if (!existing || !existing.length) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
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

    const cleanCode = code ? String(code).trim().toUpperCase() : undefined;

    if (cleanCode && cleanCode !== existing[0].code) {
      const duplicate = await prisma.$queryRawUnsafe<any[]>(
        "SELECT id FROM PromoCode WHERE code = ? LIMIT 1",
        cleanCode
      );
      if (duplicate && duplicate.length) {
        return NextResponse.json({ error: `Promo code "${cleanCode}" already exists` }, { status: 409 });
      }
    }

    const setClauses: string[] = ["updatedAt = NOW()"];
    const values: any[]        = [];

    if (cleanCode !== undefined) { setClauses.push("code = ?"); values.push(cleanCode); }
    if (titleEn !== undefined) { setClauses.push("titleEn = ?"); values.push(titleEn || null); }
    if (titleHr !== undefined) { setClauses.push("titleHr = ?"); values.push(titleHr || null); }
    if (discountType !== undefined) { setClauses.push("discountType = ?"); values.push(String(discountType).toUpperCase()); }
    if (discountValue !== undefined) { setClauses.push("discountValue = ?"); values.push(Number(discountValue)); }
    if (validFrom !== undefined) { setClauses.push("validFrom = ?"); values.push(new Date(validFrom)); }
    if (validUntil !== undefined) { setClauses.push("validUntil = ?"); values.push(validUntil ? new Date(validUntil) : null); }
    if (isActive !== undefined) { setClauses.push("isActive = ?"); values.push(isActive ? 1 : 0); }

    values.push(promoId);

    await prisma.$executeRawUnsafe(
      `UPDATE PromoCode SET ${setClauses.join(", ")} WHERE id = ?`,
      ...values
    );

    const rows = await prisma.$queryRawUnsafe<any[]>(
      "SELECT * FROM PromoCode WHERE id = ? LIMIT 1",
      promoId
    );
    const r = rows[0];
    return NextResponse.json({
      ...r,
      id: Number(r.id),
      discountValue: Number(r.discountValue),
      minOrderAmount: Number(r.minOrderAmount || 0),
      usedCount: Number(r.usedCount || 0),
      isActive: Boolean(r.isActive),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update promo code" }, { status: 500 });
  }
}

// DELETE /api/promocodes/:id — delete promo code
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const promoId = parseInt(id);

    await prisma.$executeRawUnsafe("DELETE FROM PromoCode WHERE id = ?", promoId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete promo code" }, { status: 500 });
  }
}
