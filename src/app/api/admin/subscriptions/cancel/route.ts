import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/admin/subscriptions/cancel
// Cancels a customer's active subscription in the local database and in Stripe if linked.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"];

    if (!session || !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { subscriptionId, customerId } = body;

    if (!subscriptionId && !customerId) {
      return NextResponse.json(
        { error: "subscriptionId or customerId is required" },
        { status: 400 }
      );
    }

    // 1. Locate the subscription record
    let subscription = null;
    if (subscriptionId) {
      subscription = await prisma.subscription.findUnique({
        where: { id: parseInt(subscriptionId) },
        include: { customer: true },
      });
    }

    if (!subscription && customerId) {
      subscription = await prisma.subscription.findUnique({
        where: { customerId: parseInt(customerId) },
        include: { customer: true },
      });
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription record not found" },
        { status: 404 }
      );
    }

    let stripeCancelled = false;
    let stripeError: string | null = null;

    // 2. Attempt to cancel in Stripe if paymentRef contains a Stripe sub id or customer exists
    if (process.env.STRIPE_SECRET_KEY) {
      // 2a. Direct sub_... paymentRef
      if (subscription.paymentRef && subscription.paymentRef.startsWith("sub_")) {
        try {
          await stripe.subscriptions.cancel(subscription.paymentRef);
          stripeCancelled = true;
        } catch (err: any) {
          console.warn("Failed to cancel Stripe sub by paymentRef:", err.message);
          stripeError = err.message;
        }
      }

      // 2b. Checkout session ref cs_...
      if (!stripeCancelled && subscription.paymentRef && subscription.paymentRef.startsWith("cs_")) {
        try {
          const session = await stripe.checkout.sessions.retrieve(subscription.paymentRef);
          if (session.subscription) {
            const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
            await stripe.subscriptions.cancel(subId);
            stripeCancelled = true;
          }
        } catch (err: any) {
          console.warn("Failed to cancel via Checkout Session:", err.message);
        }
      }

      // 2c. Look up active subscription in Stripe by customer email
      if (!stripeCancelled && subscription.customer?.email) {
        try {
          const customers = await stripe.customers.list({
            email: subscription.customer.email,
            limit: 1,
          });

          if (customers.data.length > 0) {
            const stripeSubs = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: "active",
              limit: 5,
            });

            for (const sub of stripeSubs.data) {
              await stripe.subscriptions.cancel(sub.id);
              stripeCancelled = true;
            }
          }
        } catch (err: any) {
          console.warn("Failed to find or cancel Stripe sub by email:", err.message);
          if (!stripeError) stripeError = err.message;
        }
      }
    }

    // 3. Update the local database record to CANCELLED
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
      include: {
        customer: { select: { fullname: true, email: true } },
        subscriptionPackage: { select: { id: true, titleEn: true, titleHr: true } },
        promoCodeRecord: true,
      },
    });

    const responseMsg = stripeCancelled
      ? "Subscription cancelled in Stripe and updated to CANCELLED in database."
      : "Subscription status updated to CANCELLED in database.";

    return NextResponse.json({
      success: true,
      message: responseMsg,
      stripeCancelled,
      stripeError: stripeCancelled ? null : stripeError,
      subscription: updated,
    });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
