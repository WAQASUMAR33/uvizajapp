import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/customers/status  (admin only)
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "id": 4, "isActive": false }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "id": 4, "isActive": false }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = parseInt(body?.id);
  const isActive = body?.isActive;

  if (isNaN(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive (boolean) is required" }, { status: 400 });
  }

  try {
    await prisma.$executeRawUnsafe(
      "UPDATE Customer SET isActive = ?, updatedAt = NOW() WHERE id = ?",
      isActive ? 1 : 0,
      id
    );
    return NextResponse.json({ id, isActive });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Update failed" }, { status: 500 });
  }
}
