import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"];

function isSuperAdmin(session: any) {
  return (session?.user as any)?.role === "SUPER_ADMIN";
}

// GET /api/users/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id, name, email, role, image, createdAt, updatedAt FROM User WHERE id = ? LIMIT 1",
    parseInt(id)
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...rows[0], id: Number(rows[0].id) });
}

// PUT /api/users/:id  — update name and/or role (SUPER_ADMIN only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const { name, role } = body ?? {};

  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  const setClauses: string[] = ["updatedAt = NOW()"];
  const values: any[]        = [];

  if (name !== undefined) { setClauses.push("name = ?");  values.push(name || null); }
  if (role !== undefined) { setClauses.push("role = ?");  values.push(role); }

  values.push(parseInt(id));

  await prisma.$executeRawUnsafe(
    `UPDATE User SET ${setClauses.join(", ")} WHERE id = ?`,
    ...values
  );

  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id, name, email, role, createdAt, updatedAt FROM User WHERE id = ? LIMIT 1",
    parseInt(id)
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...rows[0], id: Number(rows[0].id) });
}

// DELETE /api/users/:id  (SUPER_ADMIN only, cannot delete self)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const selfId = String((session!.user as any).id);
  if (selfId === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.$executeRawUnsafe("DELETE FROM User WHERE id = ?", parseInt(id));
  return NextResponse.json({ success: true });
}
