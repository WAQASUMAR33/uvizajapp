import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://uvizajapp.vercel.app";

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/verify-email?status=error&message=Missing+token`);
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(`${baseUrl}/verify-email?status=error&message=Invalid+or+expired+verification+token`);
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(`${baseUrl}/verify-email?status=error&message=Verification+token+has+expired`);
    }

    // Mark customer as verified
    await prisma.customer.updateMany({
      where: { email: record.identifier },
      data: { isEmailVerified: true },
    });

    // Delete token once used
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(`${baseUrl}/verify-email?status=success`);
  } catch (error: any) {
    console.error("Verify email GET error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://uvizajapp.vercel.app";
    return NextResponse.redirect(`${baseUrl}/verify-email?status=error&message=Internal+server+error`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Verification token has expired. Please request a new one." }, { status: 400 });
    }

    // Mark customer as verified
    await prisma.customer.updateMany({
      where: { email: record.identifier },
      data: { isEmailVerified: true },
    });

    // Clean up used token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log into your account.",
    });
  } catch (error: any) {
    console.error("Verify email POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
