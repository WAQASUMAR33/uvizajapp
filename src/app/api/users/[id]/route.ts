import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { hasPermission } from "@/lib/permissions";

function isAuthorized(session: any) {
  return session && hasPermission(session.user, "users");
}

// GET /api/users/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT u.id, u.name, u.email, u.role, u.roleId, u.permissions, u.image, u.createdAt, u.updatedAt, r.name AS roleName, r.permissions AS rolePermissions
     FROM User u
     LEFT JOIN Role r ON u.roleId = r.id
     WHERE u.id = ? LIMIT 1`,
    parseInt(id)
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...rows[0],
    id: Number(rows[0].id),
    roleId: rows[0].roleId ? Number(rows[0].roleId) : null,
    permissions: rows[0].permissions ? JSON.parse(rows[0].permissions) : null,
    rolePermissions: rows[0].rolePermissions ? JSON.parse(rows[0].rolePermissions) : null,
  });
}

// PUT /api/users/:id  — update name, role, roleId, permissions, and/or password
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const { name, role, roleId, permissions, password } = body ?? {};

  const setClauses: string[] = ["updatedAt = NOW()"];
  const values: any[]        = [];

  if (name !== undefined) { setClauses.push("name = ?");  values.push(name || null); }
  if (role !== undefined) { setClauses.push("role = ?");  values.push(role); }
  if (roleId !== undefined) { setClauses.push("roleId = ?"); values.push(roleId || null); }
  if (permissions !== undefined) {
    const permStr = Array.isArray(permissions) ? JSON.stringify(permissions) : null;
    setClauses.push("permissions = ?");
    values.push(permStr);
  }
  if (password) {
    const hashed = await bcrypt.hash(password, 12);
    setClauses.push("password = ?");
    values.push(hashed);
  }

  values.push(parseInt(id));

  await prisma.$executeRawUnsafe(
    `UPDATE User SET ${setClauses.join(", ")} WHERE id = ?`,
    ...values
  );

  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id, name, email, role, roleId, permissions, createdAt, updatedAt FROM User WHERE id = ? LIMIT 1",
    parseInt(id)
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...rows[0],
    id: Number(rows[0].id),
    roleId: rows[0].roleId ? Number(rows[0].roleId) : null,
    permissions: rows[0].permissions ? JSON.parse(rows[0].permissions) : null,
  });
}

// DELETE /api/users/:id  (cannot delete self)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const selfId = String((session!.user as any).id);
  if (selfId === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.$executeRawUnsafe("DELETE FROM User WHERE id = ?", parseInt(id));
  return NextResponse.json({ success: true });
}
