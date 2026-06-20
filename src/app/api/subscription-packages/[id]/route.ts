import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function serialize(row: any) {
  return {
    ...row,
    id: Number(row.id),
    priceMonthly: Number(row.priceMonthly),
    priceYearly: Number(row.priceYearly),
    discountValue: row.discountValue == null ? null : Number(row.discountValue),
    isActive: Boolean(row.isActive),
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, titleEn, titleHr, priceMonthly, priceYearly, discountValue, descriptionEn, descriptionHr, isActive, createdAt, updatedAt
      FROM SubscriptionPackage
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(serialize(rows[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to fetch package" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { titleEn, titleHr, priceMonthly, priceYearly, discountValue, descriptionEn, descriptionHr, isActive } = await req.json();
    const monthly  = parseFloat(priceMonthly);
    const yearly   = parseFloat(priceYearly);
    const discount = discountValue === "" || discountValue == null ? null : parseFloat(discountValue);

    await prisma.$executeRaw`
      UPDATE SubscriptionPackage
      SET titleEn = ${titleEn},
          titleHr = ${titleHr},
          priceMonthly = ${monthly},
          priceYearly = ${yearly},
          discountValue = ${discount},
          descriptionEn = ${descriptionEn ?? null},
          descriptionHr = ${descriptionHr ?? null},
          isActive = ${isActive},
          updatedAt = NOW()
      WHERE id = ${parseInt(id)}
    `;

    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, titleEn, titleHr, priceMonthly, priceYearly, discountValue, descriptionEn, descriptionHr, isActive, createdAt, updatedAt
      FROM SubscriptionPackage
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(serialize(rows[0]));
  } catch (err: any) {
    console.error("PUT /api/subscription-packages/[id]:", err);
    return NextResponse.json({ error: err?.message ?? "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.$executeRaw`DELETE FROM SubscriptionPackage WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to delete package" }, { status: 500 });
  }
}
