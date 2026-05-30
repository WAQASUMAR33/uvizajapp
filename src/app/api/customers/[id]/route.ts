import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// GET /api/customers/:id
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(params.id) },
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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { fullname, phoneNumber, nationality, dateOfBirth, gender, imageUrl, password } = await req.json();

    const data: any = {};
    if (fullname    !== undefined) data.fullname    = fullname;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (nationality !== undefined) data.nationality = nationality;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender      !== undefined) data.gender      = gender;
    if (imageUrl    !== undefined) data.imageUrl    = imageUrl;
    if (password)                  data.password    = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.update({
      where: { id: parseInt(params.id) },
      data,
      select: {
        id: true, fullname: true, email: true, uid: true,
        logType: true, phoneNumber: true, nationality: true,
        dateOfBirth: true, gender: true, imageUrl: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE /api/customers/:id
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.customer.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ success: true });
}
