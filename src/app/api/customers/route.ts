import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const skip  = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      select: {
        id: true,
        fullname: true,
        email: true,
        phoneNumber: true,
        nationality: true,
        gender: true,
        imageUrl: true,
        logType: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, endDate: true, price: true, currency: true },
        },
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count(),
  ]);

  return NextResponse.json({ customers, total, page, limit });
}
