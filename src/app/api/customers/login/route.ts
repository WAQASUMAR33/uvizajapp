import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!customer || !customer.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { password: _, ...safeCustomer } = customer;
    return NextResponse.json(safeCustomer);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
