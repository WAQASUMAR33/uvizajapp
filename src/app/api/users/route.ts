import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"];

function isAuthorized(session: any) {
  const role = (session?.user as any)?.role;
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

function isSuperAdmin(session: any) {
  return (session?.user as any)?.role === "SUPER_ADMIN";
}

// GET /api/users?search=&role=&page=1&limit=50
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const search = searchParams.get("search")?.trim() ?? "";
  const role   = searchParams.get("role")?.trim() ?? "";
  const skip   = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[]        = [];

  if (search) {
    conditions.push("(email LIKE ? OR name LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like);
  }
  if (role && VALID_ROLES.includes(role)) {
    conditions.push("role = ?");
    params.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows, countRows]: [any[], any[]] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT id, name, email, role, image, createdAt, updatedAt
       FROM User ${where} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${skip}`,
      ...params
    ),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) AS total FROM User ${where}`,
      ...params
    ),
  ]);

  return NextResponse.json({
    users: rows.map((r) => ({ ...r, id: Number(r.id) })),
    total: Number(countRows[0]?.total ?? 0),
    page,
    limit,
  });
}

// POST /api/users — create staff account
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { name, email, password, role } = body ?? {};

  if (!email || !password || !role) {
    return NextResponse.json({ error: "name, email, password and role are required" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  const existing = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id FROM User WHERE email = ? LIMIT 1", email
  );
  if (existing.length) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.$executeRawUnsafe(
    "INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
    name || null, email, hashed, role
  );

  const created = await prisma.$queryRawUnsafe<any[]>(
    "SELECT id, name, email, role, createdAt FROM User WHERE email = ? LIMIT 1", email
  );
  return NextResponse.json({ ...created[0], id: Number(created[0].id) }, { status: 201 });
}
