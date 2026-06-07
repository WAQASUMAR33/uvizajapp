import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/customers/6
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, uid, email, logType, fullname, phoneNumber, nationality,
            dateOfBirth, gender, imageUrl, isActive, createdAt, updatedAt
     FROM Customer WHERE id = ? LIMIT 1`,
    parseInt(id)
  );
  if (!rows.length) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ ...r, id: Number(r.id), isActive: Boolean(r.isActive) });
}

// PUT /api/customers/6
//
// id, uid, email, logType are immutable — ignored even if sent.
//
// ── Request body (all fields optional) ───────────────────────────────────────
// { "fullname": "Jane Doe", "phoneNumber": "+971501234567",
//   "nationality": "AE", "dateOfBirth": "1990-06-15",
//   "gender": "female", "imageUrl": "https://..." }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { id, fullname, phoneNumber, nationality, dateOfBirth, gender, imageUrl, isActive, updatedAt }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { fullname, phoneNumber, nationality, dateOfBirth, gender, imageUrl } = body;

  const setClauses: string[] = [];
  const values: any[]        = [];

  if (fullname    !== undefined) { setClauses.push("fullname = ?");    values.push(fullname); }
  if (phoneNumber !== undefined) { setClauses.push("phoneNumber = ?"); values.push(phoneNumber || null); }
  if (nationality !== undefined) { setClauses.push("nationality = ?"); values.push(nationality || null); }
  if (dateOfBirth !== undefined) { setClauses.push("dateOfBirth = ?"); values.push(dateOfBirth ? new Date(dateOfBirth) : null); }
  if (gender      !== undefined) { setClauses.push("gender = ?");      values.push(gender || null); }
  if (imageUrl    !== undefined) { setClauses.push("imageUrl = ?");    values.push(imageUrl || null); }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  setClauses.push("updatedAt = NOW()");
  values.push(parseInt(id));

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Customer SET ${setClauses.join(", ")} WHERE id = ?`,
      ...values
    );

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, fullname, phoneNumber, nationality, dateOfBirth,
              gender, imageUrl, isActive, updatedAt
       FROM Customer WHERE id = ? LIMIT 1`,
      parseInt(id)
    );

    if (!rows.length) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    const r = rows[0];
    return NextResponse.json({ ...r, id: Number(r.id), isActive: Boolean(r.isActive) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Update failed" }, { status: 500 });
  }
}

// DELETE /api/customers/6
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.$executeRawUnsafe("DELETE FROM Customer WHERE id = ?", parseInt(id));
  return NextResponse.json({ success: true });
}
