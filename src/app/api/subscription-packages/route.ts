import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function serialize(rows: any[]) {
  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    priceMonthly: Number(r.priceMonthly),
    priceYearly: Number(r.priceYearly),
    isActive: Boolean(r.isActive),
  }));
}

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, title, priceMonthly, priceYearly, description, isActive, createdAt, updatedAt
      FROM SubscriptionPackage
      ORDER BY createdAt ASC
    `;
    return NextResponse.json(serialize(rows));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, priceMonthly, priceYearly, description, isActive } = await req.json();
    const monthly = parseFloat(priceMonthly);
    const yearly  = parseFloat(priceYearly);
    const active  = isActive ?? true;

    await prisma.$executeRaw`
      INSERT INTO SubscriptionPackage (title, priceMonthly, priceYearly, description, isActive, createdAt, updatedAt)
      VALUES (${title}, ${monthly}, ${yearly}, ${description ?? null}, ${active}, NOW(), NOW())
    `;

    const [pkg] = await prisma.$queryRaw<any[]>`
      SELECT id, title, priceMonthly, priceYearly, description, isActive, createdAt, updatedAt
      FROM SubscriptionPackage
      WHERE id = LAST_INSERT_ID()
    `;

    return NextResponse.json(serialize([pkg])[0], { status: 201 });
  } catch (err: any) {
    console.error("POST /api/subscription-packages:", err);
    return NextResponse.json({ error: err?.message ?? "Failed to create package" }, { status: 500 });
  }
}
