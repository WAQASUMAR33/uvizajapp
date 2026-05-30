import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password, phoneNumber, nationality, dateOfBirth, gender, imageUrl, uid, logType } = await req.json();

    if (!email || !fullname) {
      return NextResponse.json({ error: "fullname and email are required" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = password ? await bcrypt.hash(password, 12) : null;

    const customer = await prisma.customer.create({
      data: {
        fullname,
        email,
        password:    hashed,
        uid:         uid        ?? null,
        logType:     logType    ?? "email",
        phoneNumber: phoneNumber ?? null,
        nationality: nationality ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender:      gender     ?? null,
        imageUrl:    imageUrl   ?? null,
      },
      select: {
        id: true, fullname: true, email: true, uid: true,
        logType: true, phoneNumber: true, nationality: true,
        dateOfBirth: true, gender: true, imageUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
