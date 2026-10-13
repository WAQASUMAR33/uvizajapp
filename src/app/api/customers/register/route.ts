import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendCustomerEmailVerificationLink } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password, phoneNumber, nationality, dateOfBirth, gender, imageUrl, uid, logType } = await req.json();

    if (!email || !fullname) {
      return NextResponse.json({ error: "fullname and email are required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const existing = await prisma.customer.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const isSocial = Boolean(logType && logType !== "email");
    const hashed = password ? await bcrypt.hash(password, 12) : null;

    const customer = await prisma.customer.create({
      data: {
        fullname:    fullname.trim(),
        email:       cleanEmail,
        password:    hashed,
        uid:         uid        ?? null,
        logType:     logType    ?? "email",
        phoneNumber: phoneNumber ?? null,
        nationality: nationality ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender:      gender     ?? null,
        imageUrl:    imageUrl   ?? null,
        isEmailVerified: isSocial,
      },
      select: {
        id: true, fullname: true, email: true, uid: true,
        logType: true, phoneNumber: true, nationality: true,
        dateOfBirth: true, gender: true, imageUrl: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email for standard email registrations
    if (!isSocial) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.deleteMany({ where: { identifier: cleanEmail } });
      await prisma.verificationToken.create({
        data: {
          identifier: cleanEmail,
          token,
          expires,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://uvizajapp.vercel.app";
      const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

      await sendCustomerEmailVerificationLink(cleanEmail, verifyUrl, fullname.trim());
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
