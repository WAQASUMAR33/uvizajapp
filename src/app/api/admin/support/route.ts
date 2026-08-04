import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { SupportStatus } from "@prisma/client";

// GET /api/admin/support?page=1&limit=20&search=...&status=all|PENDING|IN_PROGRESS|RESOLVED|CLOSED
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user, "support")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const search = searchParams.get("search")?.trim() ?? "";
    const statusParam = searchParams.get("status") ?? "all";
    const skip = (page - 1) * limit;

    const where: any = {};

    if (statusParam !== "all" && Object.values(SupportStatus).includes(statusParam as SupportStatus)) {
      where.status = statusParam as SupportStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [tickets, total, pendingCount, inProgressCount, resolvedCount, closedCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              fullname: true,
              email: true,
              phoneNumber: true,
              imageUrl: true,
              subscription: {
                select: {
                  plan: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
      prisma.supportTicket.count({ where: { status: "CLOSED" } }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      page,
      limit,
      stats: {
        total: pendingCount + inProgressCount + resolvedCount + closedCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin support tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
