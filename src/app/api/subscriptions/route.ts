import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions?customerId=123
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { customerId: parseInt(customerId) },
    include: {
      subscriptionPackage: {
        select: { id: true, title: true, priceMonthly: true, priceYearly: true, description: true },
      },
    },
  });

  return NextResponse.json(sub);
}

// POST /api/subscriptions
//
// Creates or renews (upserts) a subscription for a customer.
// Price is derived from the SubscriptionPackage when subscriptionPackageId is supplied.
// Falls back to hard-coded prices when only `plan` is provided (legacy path).
//
// ── Request body ────────────────────────────────────────────────────────────
// {
//   "customerId":            123,          // required — Customer.id
//   "subscriptionPackageId": 2,            // required — SubscriptionPackage.id
//   "plan":                  "ANNUAL",     // required — "MONTHLY" | "ANNUAL"
//   "paymentRef":            "PAY_ABC123", // optional — payment gateway reference
//   "platform":              "ios"         // optional — "ios" | "android" | "web"
// }
//
// ── Success response (201) ───────────────────────────────────────────────────
// {
//   "id":                    1,
//   "customerId":            123,
//   "subscriptionPackageId": 2,
//   "plan":                  "ANNUAL",
//   "status":                "ACTIVE",
//   "startDate":             "2026-06-05T10:00:00.000Z",
//   "endDate":               "2027-06-05T10:00:00.000Z",
//   "price":                 79.99,
//   "currency":              "EUR",
//   "paymentRef":            "PAY_ABC123",
//   "platform":              "ios",
//   "createdAt":             "2026-06-05T10:00:00.000Z",
//   "updatedAt":             "2026-06-05T10:00:00.000Z",
//   "subscriptionPackage": {
//     "id":           2,
//     "title":        "Premium Annual",
//     "priceMonthly": 9.99,
//     "priceYearly":  79.99,
//     "description":  "Best value plan"
//   }
// }
export async function POST(req: NextRequest) {
  try {
    const { customerId, subscriptionPackageId, plan, paymentRef, platform } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }
    if (!plan || !["MONTHLY", "ANNUAL"].includes(plan)) {
      return NextResponse.json({ error: "plan must be MONTHLY or ANNUAL" }, { status: 400 });
    }

    // Derive price from the linked SubscriptionPackage when provided
    let price = plan === "MONTHLY" ? 9.99 : 79.99; // fallback defaults

    let packageRecord: { id: number; title: string; priceMonthly: number; priceYearly: number; description: string | null } | null = null;

    if (subscriptionPackageId) {
      packageRecord = await prisma.subscriptionPackage.findUnique({
        where: { id: parseInt(subscriptionPackageId) },
        select: { id: true, title: true, priceMonthly: true, priceYearly: true, description: true },
      });

      if (!packageRecord) {
        return NextResponse.json(
          { error: `SubscriptionPackage with id ${subscriptionPackageId} not found` },
          { status: 404 }
        );
      }

      price = plan === "MONTHLY" ? packageRecord.priceMonthly : packageRecord.priceYearly;
    }

    // Calculate end date based on plan duration
    const endDate = new Date();
    if (plan === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const id = parseInt(customerId);

    const writeData = {
      plan,
      status:               "ACTIVE" as const,
      endDate,
      price,
      currency:             "EUR",
      paymentRef:           paymentRef ?? null,
      platform:             platform   ?? null,
      subscriptionPackageId: subscriptionPackageId ? parseInt(subscriptionPackageId) : null,
    };

    const subscription = await prisma.subscription.upsert({
      where:  { customerId: id },
      update: writeData,
      create: { customerId: id, ...writeData },
      include: {
        subscriptionPackage: {
          select: { id: true, title: true, priceMonthly: true, priceYearly: true, description: true },
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
