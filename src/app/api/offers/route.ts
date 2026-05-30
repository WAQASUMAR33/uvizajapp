import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId");

  const where: any = { isActive: true };
  if (merchantId) where.merchantId = merchantId;

  const offers = await prisma.offer.findMany({
    where,
    include: { merchant: { select: { id: true, name: true, images: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const offer = await prisma.offer.create({ data: body });
    return NextResponse.json(offer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
