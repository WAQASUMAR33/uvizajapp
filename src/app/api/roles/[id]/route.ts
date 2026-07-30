import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAuthorized(session: any) {
  const role = (session?.user as any)?.role;
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

// GET /api/roles/:id
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id: parseInt(id) } });

  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json({
    ...role,
    permissions: typeof role.permissions === "string" ? JSON.parse(role.permissions || "[]") : role.permissions,
  });
}

// PUT /api/roles/:id — update name, description, permissions
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const roleId = parseInt(id);

  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  if (existing.isSystem) {
    return NextResponse.json({ error: "System default roles cannot be modified" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { name, description, permissions } = body ?? {};

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(Array.isArray(permissions) ? { permissions: JSON.stringify(permissions) } : {}),
    },
  });

  return NextResponse.json({
    ...updated,
    permissions: typeof updated.permissions === "string" ? JSON.parse(updated.permissions || "[]") : updated.permissions,
  });
}

// DELETE /api/roles/:id — delete custom role
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const roleId = parseInt(id);

  const existing = await prisma.role.findUnique({ where: { id: roleId } });
  if (!existing) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  if (existing.isSystem) {
    return NextResponse.json({ error: "System default roles cannot be deleted" }, { status: 400 });
  }

  await prisma.role.delete({ where: { id: roleId } });

  return NextResponse.json({ success: true });
}
