import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/customers/check-email
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "email": "user@example.com" }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "exists": true }   — account found
// { "exists": false }  — no account with that email
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { email },
    select: {
      id: true, uid: true, email: true, logType: true,
      fullname: true, phoneNumber: true, nationality: true,
      dateOfBirth: true, gender: true, imageUrl: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!customer) {
    return NextResponse.json({ exists: false, customer: null });
  }

  return NextResponse.json({ exists: true, customer });
}
