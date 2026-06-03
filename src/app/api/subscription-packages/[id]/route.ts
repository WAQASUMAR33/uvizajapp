import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.subscriptionPackage.findUnique({
    where: { id: parseInt(id) },
  });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  return NextResponse.json(pkg);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, priceMonthly, priceYearly, description, isActive } = await req.json();

  try {
    const pkg = await prisma.subscriptionPackage.update({
      where: { id: parseInt(id) },
      data: {
        title,
        priceMonthly: parseFloat(priceMonthly),
        priceYearly: parseFloat(priceYearly),
        description,
        isActive,
      },
    });
    return NextResponse.json(pkg);
  } catch {
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.subscriptionPackage.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
