import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/id?id=4
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "id", "uid", "email", "logType", "fullname", "phoneNumber",
//   "nationality", "dateOfBirth", "gender", "imageUrl", "createdAt", "updatedAt" }
export async function GET(req: NextRequest) {
  const id = parseInt(req.nextUrl.searchParams.get("id") ?? "");
  if (isNaN(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true, uid: true, email: true, logType: true,
      fullname: true, phoneNumber: true, nationality: true,
      dateOfBirth: true, gender: true, imageUrl: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

// PUT /api/customers/id
//
// id, uid, email, and logType are immutable — ignored even if sent.
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "id": 4, "fullname": "Jane Doe", "phoneNumber": "+971501234567",
//   "nationality": "AE", "dateOfBirth": "1990-06-15",
//   "gender": "female", "imageUrl": "https://..." }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "id", "fullname", "phoneNumber", "nationality", "dateOfBirth",
//   "gender", "imageUrl", "updatedAt" }
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = parseInt(body?.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { fullname, phoneNumber, nationality, dateOfBirth, gender, imageUrl } = body;

  const data: any = {};
  if (fullname    !== undefined) data.fullname    = fullname;
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (nationality !== undefined) data.nationality = nationality;
  if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (gender      !== undefined) data.gender      = gender;
  if (imageUrl    !== undefined) data.imageUrl    = imageUrl;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true, fullname: true, phoneNumber: true, nationality: true,
        dateOfBirth: true, gender: true, imageUrl: true, updatedAt: true,
      },
    });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Update failed or customer not found" }, { status: 500 });
  }
}

// DELETE /api/customers/id?id=4
export async function DELETE(req: NextRequest) {
  const id = parseInt(req.nextUrl.searchParams.get("id") ?? "");
  if (isNaN(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
