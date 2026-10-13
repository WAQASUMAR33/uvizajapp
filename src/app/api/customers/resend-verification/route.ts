import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendCustomerEmailVerificationLink } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      // Don't leak user existence
      return NextResponse.json({ success: true, message: "If an account exists, a verification link has been sent." });
    }

    if (customer.isEmailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://uvizajapp.vercel.app";
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    await sendCustomerEmailVerificationLink(email, verifyUrl, customer.fullname);

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
