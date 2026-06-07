import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true, fullname: true, email: true, uid: true,
      logType: true, phoneNumber: true, nationality: true,
      dateOfBirth: true, gender: true, imageUrl: true,
      createdAt: true, updatedAt: true,
      subscription: true,
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

// PUT /api/customers/:id  — update profile
//
// Only the following fields can be updated.
// id, uid, email, and logType are immutable and ignored if sent.
//
// ── Request body (all fields optional) ───────────────────────────────────────
// { "fullname": "Jane Doe", "phoneNumber": "+971501234567",
//   "nationality": "AE", "dateOfBirth": "1990-06-15",
//   "gender": "female", "imageUrl": "https://..." }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "id", "fullname", "phoneNumber", "nationality", "dateOfBirth",
//   "gender", "imageUrl", "updatedAt" }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { fullname, phoneNumber, nationality, dateOfBirth, gender, imageUrl } = await req.json();

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

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
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

// DELETE /api/customers/:id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
