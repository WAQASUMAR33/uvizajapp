import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, fullname, imageUrl, logType } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    // Find by uid first, fall back to email match
    let customer = await prisma.customer.findFirst({
      where: { OR: [{ uid }, { email }] },
      include: { subscription: true },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullname: fullname || email,
          email,
          uid,
          logType: logType || "google",
          imageUrl: imageUrl || null,
        },
        include: { subscription: true },
      });
    } else if (!customer.uid) {
      // Link existing email account to social uid
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { uid, logType: logType || customer.logType },
        include: { subscription: true },
      });
    }

    const { password: _pw, ...safeCustomer } = customer as typeof customer & { password?: unknown };
    return NextResponse.json(safeCustomer);
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
