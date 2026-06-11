import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { email, code } = body ?? {};

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const token = `${emailClean}:${code.trim()}`;

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.identifier !== emailClean) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    return NextResponse.json({ success: true, token: record.token });
  } catch (error: any) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
