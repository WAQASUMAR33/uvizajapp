import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomerVerificationCodeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!customer) {
      console.log(`[Forgot Password] Customer with email ${email} not found. Returning success.`);
      return NextResponse.json({ success: true });
    }

    // Only allow password reset for credentials login types
    if (customer.logType !== "email") {
      console.log(`[Forgot Password] Customer with email ${email} registered via social login (${customer.logType}). Returning success without sending email.`);
      return NextResponse.json({ success: true });
    }

    // Generate a 6-digit code: 100000 to 999999
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // To prevent unique constraint issues on VerificationToken.token table,
    // we save it as `email:code` which is guaranteed unique.
    const token = `${email}:${code}`;
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    await sendCustomerVerificationCodeEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
