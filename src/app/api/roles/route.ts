import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_SYSTEM_ROLES = [
  {
    name: "Super Admin",
    description: "Full unrestricted access to system settings, database & staff management.",
    permissions: JSON.stringify(["dashboard", "merchants", "categories", "offers", "customers", "redemptions", "subscriptions", "subscription_packages", "terms", "users", "roles"]),
    isSystem: true,
  },
  {
    name: "Admin",
    description: "Manage merchants, categories, offers, customers, subscriptions, terms & staff users.",
    permissions: JSON.stringify(["dashboard", "merchants", "categories", "offers", "customers", "redemptions", "subscriptions", "subscription_packages", "terms", "users"]),
    isSystem: true,
  },
  {
    name: "Accountant",
    description: "Access customer subscriptions, packages, redemptions history & financial reports.",
    permissions: JSON.stringify(["dashboard", "customers", "redemptions", "subscriptions", "subscription_packages"]),
    isSystem: true,
  },
  {
    name: "Salesman",
    description: "Onboard & manage merchant listings, view redemption analytics & merchant stats.",
    permissions: JSON.stringify(["dashboard", "merchants"]),
    isSystem: true,
  },
];

import { hasPermission } from "@/lib/permissions";

function isAuthorized(session: any) {
  return session && (hasPermission(session.user, "roles") || hasPermission(session.user, "users"));
}

// GET /api/roles — list all system & custom roles
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure system default roles exist
  try {
    const existingCount = await prisma.role.count();
    if (existingCount === 0) {
      for (const sysRole of DEFAULT_SYSTEM_ROLES) {
        await prisma.role.create({ data: sysRole }).catch(() => null);
      }
    }
  } catch {
    // ignore seed error if table is still creating
  }

  const roles = await prisma.role.findMany({
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    roles: roles.map((r) => ({
      ...r,
      permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions || "[]") : r.permissions,
    })),
  });
}

// POST /api/roles — create new custom role
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { name, description, permissions } = body ?? {};

  if (!name || !Array.isArray(permissions)) {
    return NextResponse.json({ error: "Name and permissions array are required" }, { status: 400 });
  }

  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
  }

  const created = await prisma.role.create({
    data: {
      name,
      description: description || null,
      permissions: JSON.stringify(permissions),
      isSystem: false,
    },
  });

  return NextResponse.json({
    ...created,
    permissions: JSON.parse(created.permissions),
  }, { status: 201 });
}
