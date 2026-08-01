import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id: parseInt(id) },
    include: { merchant: true },
  });
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw: any[] = await prisma.$queryRawUnsafe(
    `SELECT discountValue FROM Offer WHERE id = ?`, parseInt(id)
  );
  return NextResponse.json({ ...offer, discountValue: raw[0]?.discountValue ?? null });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user, "offers")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const offerId = parseInt(id);

  try {
    const body = await req.json();
    // Strip fields Prisma cannot accept in update data
    const { discountValue, id: _id, createdAt: _c, updatedAt: _u, merchant: _m, validFrom: _vf, ...rest } = body;

    if (rest.validUntil !== undefined) rest.validUntil = rest.validUntil ? new Date(rest.validUntil) : null;
    if (rest.merchantId) rest.merchantId = parseInt(rest.merchantId);

    const offer = await prisma.offer.update({ where: { id: offerId }, data: rest });

    // Save discountValue via raw SQL (Prisma client not yet regenerated for this field)
    await prisma.$executeRawUnsafe(
      `UPDATE Offer SET discountValue = ? WHERE id = ?`,
      discountValue ?? null,
      offerId
    );

    return NextResponse.json({ ...offer, discountValue: discountValue ?? null });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user, "offers")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.offer.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
