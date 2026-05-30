import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admin-only: list all subscriptions with customer info
export async function GET() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      customer: { select: { fullname: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}
