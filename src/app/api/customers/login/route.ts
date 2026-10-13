import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required", message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
      where: { email: cleanEmail },
      include: { subscription: true },
    });

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: "Invalid email or password", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (customer.isActive === false) {
      return NextResponse.json(
        {
          error: "Your account has been suspended. Please contact support.",
          message: "Your account has been suspended. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Check if email is verified for email accounts
    if (customer.logType === "email" && customer.isEmailVerified === false) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
          isEmailVerified: false,
        },
        { status: 403 }
      );
    }

    const { password: _, ...safeCustomer } = customer;
    return NextResponse.json(safeCustomer);
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

