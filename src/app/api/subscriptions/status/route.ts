import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/subscriptions/status
//
// Returns the subscription status for a customer.
// Automatically returns status=EXPIRED if endDate has passed, even if DB still says ACTIVE.
//
// ── Request body ─────────────────────────────────────────────────────────────
// { "customerId": 123 }
//
// ── Success response ─────────────────────────────────────────────────────────
// {
//   "subscribed": true,
//   "status": "ACTIVE",          // ACTIVE | EXPIRED | CANCELLED | null (no subscription)
//   "plan": "ANNUAL",            // MONTHLY | ANNUAL | null
//   "startDate": "...",
//   "endDate": "...",
//   "daysRemaining": 120,        // 0 if expired
//   "subscriptionPackage": { id, title, priceMonthly, priceYearly, description }
// }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const customerId = body?.customerId;

  if (!customerId || isNaN(parseInt(customerId))) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { customerId: parseInt(customerId) },
    select: {
      status:    true,
      plan:      true,
      startDate: true,
      endDate:   true,
      price:     true,
      currency:  true,
      subscriptionPackage: {
        select: { id: true, title: true, priceMonthly: true, priceYearly: true, description: true },
      },
    },
  });

  if (!sub) {
    return NextResponse.json({
      subscribed:          false,
      status:              null,
      plan:                null,
      startDate:           null,
      endDate:             null,
      daysRemaining:       0,
      subscriptionPackage: null,
    });
  }

  const now = new Date();
  const isExpired = sub.endDate < now;
  const status = isExpired ? "EXPIRED" : sub.status;
  const daysRemaining = isExpired
    ? 0
    : Math.ceil((sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    subscribed:          status === "ACTIVE",
    status,
    plan:                sub.plan,
    startDate:           sub.startDate,
    endDate:             sub.endDate,
    price:               sub.price,
    currency:            sub.currency,
    daysRemaining,
    subscriptionPackage: sub.subscriptionPackage,
  });
}
