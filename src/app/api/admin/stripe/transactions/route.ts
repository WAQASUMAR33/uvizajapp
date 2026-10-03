import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"];

    if (!session || !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch PaymentIntents from Stripe
    const paymentIntentsResponse = await stripe.paymentIntents.list({
      limit: 100,
      expand: ["data.customer", "data.latest_charge"],
    });

    const paymentIntents = paymentIntentsResponse.data;

    // 2. Fetch all local customers to cross-reference metadata
    const customerIds = paymentIntents
      .map((pi) => pi.metadata?.customerId ? parseInt(pi.metadata.customerId) : null)
      .filter((id): id is number => id !== null && !isNaN(id));

    const localCustomers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, fullname: true, email: true },
    });

    const customerMap = new Map(localCustomers.map((c) => [c.id, c]));

    // 3. Format transactions
    const transactions = paymentIntents.map((pi) => {
      const latestCharge = pi.latest_charge as any;
      const customerObj = pi.customer as any;
      const metadataCustId = pi.metadata?.customerId ? parseInt(pi.metadata.customerId) : null;
      const localCust = metadataCustId ? customerMap.get(metadataCustId) : null;

      const customerName =
        localCust?.fullname ||
        (customerObj && typeof customerObj === "object" ? customerObj.name : null) ||
        latestCharge?.billing_details?.name ||
        "Subscriber";

      const customerEmail =
        localCust?.email ||
        (customerObj && typeof customerObj === "object" ? customerObj.email : null) ||
        latestCharge?.billing_details?.email ||
        pi.receipt_email ||
        "—";

      const cardBrand = latestCharge?.payment_method_details?.card?.brand || null;
      const cardLast4 = latestCharge?.payment_method_details?.card?.last4 || null;
      const receiptUrl = latestCharge?.receipt_url || null;

      return {
        id: pi.id,
        chargeId: latestCharge?.id || null,
        amount: pi.amount / 100,
        amountReceived: pi.amount_received / 100,
        currency: pi.currency.toUpperCase(),
        status: pi.status,
        livemode: pi.livemode,
        created: new Date(pi.created * 1000).toISOString(),
        customer: {
          id: customerObj?.id || (typeof pi.customer === "string" ? pi.customer : null),
          localId: metadataCustId,
          name: customerName,
          email: customerEmail,
        },
        paymentMethod: {
          type: pi.payment_method_types?.[0] || "card",
          brand: cardBrand,
          last4: cardLast4,
        },
        plan: pi.metadata?.plan || "ANNUAL",
        packageId: pi.metadata?.subscriptionPackageId || null,
        promoCode: pi.metadata?.promoCode || null,
        receiptUrl,
        clientSecret: pi.client_secret,
      };
    });

    // 4. Calculate summary stats
    const totalVolume = transactions
      .filter((t) => t.status === "succeeded")
      .reduce((sum, t) => sum + t.amountReceived, 0);

    const successfulCount = transactions.filter((t) => t.status === "succeeded").length;
    const failedCount = transactions.filter((t) => t.status === "requires_payment_method" || t.status === "canceled").length;
    const processingCount = transactions.filter((t) => t.status === "processing" || t.status === "requires_capture" || t.status === "requires_action").length;

    return NextResponse.json({
      transactions,
      metrics: {
        totalVolume,
        totalCount: transactions.length,
        successfulCount,
        failedCount,
        processingCount,
        currency: transactions[0]?.currency || "EUR",
      },
    });
  } catch (error: any) {
    console.error("Error fetching Stripe transactions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch Stripe transactions" },
      { status: 500 }
    );
  }
}
