import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const packages = await prisma.subscriptionPackage.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, priceMonthly, priceYearly, description, isActive } = await req.json();
    const pkg = await prisma.subscriptionPackage.create({
      data: {
        title,
        priceMonthly: parseFloat(priceMonthly),
        priceYearly: parseFloat(priceYearly),
        description,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(pkg, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
