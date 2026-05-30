import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (userId !== id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      subscription: true,
      redemptions: {
        include: {
          offer: { select: { id: true, title: true, discount: true } },
          merchant: { select: { id: true, name: true, images: true } },
        },
        orderBy: { redeemedAt: "desc" },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (userId !== id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = isAdmin ? body : { name: body.name, image: body.image };

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: allowed,
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  return NextResponse.json(user);
}
