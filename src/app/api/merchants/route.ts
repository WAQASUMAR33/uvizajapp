import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };
  if (category) where.category = category;
  if (search) where.name = { contains: search };

  const [merchants, total] = await Promise.all([
    prisma.merchant.findMany({
      where,
      include: { offers: { where: { isActive: true }, take: 3 } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.merchant.count({ where }),
  ]);

  return NextResponse.json({ merchants, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const merchant = await prisma.merchant.create({ data: body });
    return NextResponse.json(merchant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create merchant" }, { status: 500 });
  }
}
