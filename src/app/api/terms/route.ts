import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/terms  — public
//
// ── Response (200) ────────────────────────────────────────────────────────────
// { "contentEn": "<p>...</p>", "contentHr": "<p>...</p>", "updatedAt": "2026-06-07T..." }
// { "contentEn": null, "contentHr": null } — not set yet
export async function GET() {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    "SELECT contentEn, contentHr, updatedAt FROM TermsAndConditions ORDER BY id DESC LIMIT 1"
  );
  if (!rows.length) return NextResponse.json({ contentEn: null, contentHr: null });
  return NextResponse.json({ contentEn: rows[0].contentEn, contentHr: rows[0].contentHr, updatedAt: rows[0].updatedAt });
}

// PUT /api/terms  — admin only
//
// ── Request body ──────────────────────────────────────────────────────────────
// { "contentEn": "<p>English terms...</p>", "contentHr": "<p>Croatian terms...</p>" }
//
// ── Response (200) ────────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contentEn = typeof body?.contentEn === "string" ? body.contentEn : "";
  const contentHr = typeof body?.contentHr === "string" ? body.contentHr : "";

  if (!contentEn.trim() && !contentHr.trim()) {
    return NextResponse.json({ error: "at least one of contentEn or contentHr is required" }, { status: 400 });
  }

  try {
    // Check if a record exists
    const existing = await prisma.$queryRawUnsafe<any[]>(
      "SELECT id FROM TermsAndConditions LIMIT 1"
    );

    if (existing.length) {
      await prisma.$executeRawUnsafe(
        "UPDATE TermsAndConditions SET contentEn = ?, contentHr = ?, updatedAt = NOW() WHERE id = ?",
        contentEn,
        contentHr,
        Number(existing[0].id)
      );
    } else {
      await prisma.$executeRawUnsafe(
        "INSERT INTO TermsAndConditions (contentEn, contentHr, updatedAt) VALUES (?, ?, NOW())",
        contentEn,
        contentHr
      );
    }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      "SELECT contentEn, contentHr, updatedAt FROM TermsAndConditions ORDER BY id DESC LIMIT 1"
    );
    return NextResponse.json({ contentEn: rows[0].contentEn, contentHr: rows[0].contentHr, updatedAt: rows[0].updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Save failed" }, { status: 500 });
  }
}
