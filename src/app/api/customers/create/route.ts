import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/customers/create
//
// Creates a new customer account via social / app login.
// Returns 409 if the email or uid is already registered.
// The uid, email, and logType fields are immutable after creation.
//
// ── Request body ──────────────────────────────────────────────────────────────
// {
//   "uid":     "firebase-uid-abc123",
//   "email":   "user@example.com",
//   "logType": "google"            // "email" | "google" | "apple"
// }
//
// ── Success (201) ─────────────────────────────────────────────────────────────
// { "id": 12, "uid": "firebase-uid-abc123", "email": "user@example.com", "logType": "google" }
//
// ── Already registered (409) ──────────────────────────────────────────────────
// { "error": "An account with this email already exists" }
// { "error": "An account with this uid already exists" }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const uid     = typeof body?.uid     === "string" ? body.uid.trim()                    : "";
  const email   = typeof body?.email   === "string" ? body.email.trim().toLowerCase()    : "";
  const logType = typeof body?.logType === "string" ? body.logType.trim().toLowerCase()  : "";

  if (!uid)     return NextResponse.json({ error: "uid is required" },     { status: 400 });
  if (!email)   return NextResponse.json({ error: "email is required" },   { status: 400 });
  if (!logType) return NextResponse.json({ error: "logType is required" }, { status: 400 });

  const validLogTypes = ["email", "google", "apple"];
  if (!validLogTypes.includes(logType)) {
    return NextResponse.json(
      { error: `logType must be one of: ${validLogTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findFirst({
    where: { OR: [{ email }, { uid }] },
    select: { email: true, uid: true },
  });

  if (existing) {
    const conflict =
      existing.email === email
        ? "An account with this email already exists"
        : "An account with this uid already exists";
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  const customer = await prisma.customer.create({
    data: { uid, email, logType, fullname: email },
    select: { id: true, uid: true, email: true, logType: true },
  });

  return NextResponse.json(customer, { status: 201 });
}
