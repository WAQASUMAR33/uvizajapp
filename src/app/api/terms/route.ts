import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/terms  — public
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "content": "<p>...</p>", "updatedAt": "2026-06-07T..." }
// { "content": null } — not set yet
export async function GET() {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT content, updatedAt FROM TermsAndConditions ORDER BY id DESC LIMIT 1"
  );
  if (!rows.length) return NextResponse.json({ content: null });
  return NextResponse.json({ content: rows[0].content, updatedAt: rows[0].updatedAt });
}

// PUT /api/terms  — admin only
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "content": "<p>Your terms here...</p>" }
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "content": "<p>...</p>", "updatedAt": "2026-06-07T..." }
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content : "";

  if (!content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    // Check if a record exists
    const existing = await prisma.$queryRawUnsafe<any[]>(
      "SELECT id FROM TermsAndConditions LIMIT 1"
    );

    if (existing.length) {
      await prisma.$executeRawUnsafe(
        "UPDATE TermsAndConditions SET content = ?, updatedAt = NOW() WHERE id = ?",
        content,
        Number(existing[0].id)
      );
    } else {
      await prisma.$executeRawUnsafe(
        "INSERT INTO TermsAndConditions (content, updatedAt) VALUES (?, NOW())",
        content
      );
    }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      "SELECT content, updatedAt FROM TermsAndConditions ORDER BY id DESC LIMIT 1"
    );
    return NextResponse.json({ content: rows[0].content, updatedAt: rows[0].updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Save failed" }, { status: 500 });
  }
}
