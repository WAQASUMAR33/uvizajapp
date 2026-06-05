import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id: parseInt(id) },
    include: {
      offers:  { where: { isActive: true }, take: 3 },
      ratings: { select: { customerId: true, rating: true, review: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(merchant);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    // Strip fields that must not be passed to update: auto-managed columns and relation arrays
    const { id: _id, createdAt: _c, updatedAt: _u, offers: _o, redemptions: _r, ...data } = body;
    const merchant = await prisma.merchant.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json(merchant);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.merchant.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
