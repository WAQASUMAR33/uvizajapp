import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

// GET /api/terms — public
export async function GET() {
  try {
    const record = await (prisma as any).termsAndConditions?.findFirst({
      orderBy: { id: "desc" },
    });
    if (record) {
      return NextResponse.json({
        contentEn: record.contentEn,
        contentHr: record.contentHr,
        updatedAt: record.updatedAt,
      });
    }
  } catch {
    // Fall back to raw SQL
  }

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      "SELECT contentEn, contentHr, updatedAt FROM TermsAndConditions ORDER BY id DESC LIMIT 1"
    );
    if (!rows.length) return NextResponse.json({ contentEn: null, contentHr: null });
    return NextResponse.json({
      contentEn: rows[0].contentEn,
      contentHr: rows[0].contentHr,
      updatedAt: rows[0].updatedAt,
    });
  } catch {
    return NextResponse.json({ contentEn: null, contentHr: null });
  }
}

// PUT /api/terms — admin only
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user, "terms")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contentEn = typeof body?.contentEn === "string" ? body.contentEn : "";
  const contentHr = typeof body?.contentHr === "string" ? body.contentHr : "";

  if (!contentEn.trim() && !contentHr.trim()) {
    return NextResponse.json(
      { error: "At least one of English or Croatian terms is required." },
      { status: 400 }
    );
  }

  // 1. Try Prisma Model
  try {
    const model = (prisma as any).termsAndConditions;
    if (model) {
      const existing = await model.findFirst();
      let saved;
      if (existing) {
        saved = await model.update({
          where: { id: existing.id },
          data: { contentEn, contentHr },
        });
      } else {
        saved = await model.create({
          data: { contentEn, contentHr },
        });
      }
      return NextResponse.json({
        contentEn: saved.contentEn,
        contentHr: saved.contentHr,
        updatedAt: saved.updatedAt,
      });
    }
  } catch {
    // Proceed to raw SQL
  }

  // 2. Fallback to raw SQL
  try {
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
    return NextResponse.json({
      contentEn: rows[0].contentEn,
      contentHr: rows[0].contentHr,
      updatedAt: rows[0].updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Save failed" }, { status: 500 });
  }
}
