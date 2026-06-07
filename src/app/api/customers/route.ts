import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/customers?page=1&limit=50&search=john&status=all
// status: "all" | "active" | "inactive"
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "all";
  const skip   = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[]        = [];

  if (search) {
    conditions.push("(c.fullname LIKE ? OR c.email LIKE ? OR c.phoneNumber LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (status === "active")   conditions.push("c.isActive = 1");
  if (status === "inactive") conditions.push("c.isActive = 0");

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows, countRows]: [any[], any[]] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT c.id, c.fullname, c.email, c.uid, c.logType,
              c.phoneNumber, c.nationality, c.gender, c.imageUrl,
              c.isActive, c.createdAt, c.updatedAt,
              s.plan AS subPlan, s.status AS subStatus, s.endDate AS subEndDate,
              s.price AS subPrice, s.currency AS subCurrency
       FROM Customer c
       LEFT JOIN Subscription s ON s.customerId = c.id
       ${where}
       ORDER BY c.createdAt DESC
       LIMIT ${limit} OFFSET ${skip}`,
      ...params
    ),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) AS total FROM Customer c ${where}`,
      ...params
    ),
  ]);

  const customers = rows.map((r) => ({
    id:          Number(r.id),
    fullname:    r.fullname,
    email:       r.email,
    uid:         r.uid,
    logType:     r.logType,
    phoneNumber: r.phoneNumber,
    nationality: r.nationality,
    gender:      r.gender,
    imageUrl:    r.imageUrl,
    isActive:    Boolean(r.isActive),
    createdAt:   r.createdAt,
    updatedAt:   r.updatedAt,
    subscription: r.subPlan
      ? { plan: r.subPlan, status: r.subStatus, endDate: r.subEndDate, price: Number(r.subPrice), currency: r.subCurrency }
      : null,
  }));

  return NextResponse.json({
    customers,
    total: Number(countRows[0]?.total ?? 0),
    page,
    limit,
  });
}
