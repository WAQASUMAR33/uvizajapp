import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { syncCustomerSubscription } from "@/lib/stripe-subscription";
import Stripe from "stripe";

interface SubscriptionWithPeriod extends Stripe.Subscription {
  current_period_end?: number;
}

// POST /api/stripe/webhook
// Stripe Webhook listener to automatically synchronize subscription statuses and renewals
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("⚠️ STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ─────────────────────────────────────────────────────────────────────────
      // 1. Checkout Session Completed (Web Subscription)
      // ─────────────────────────────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as SubscriptionWithPeriod;
          const metadata = session.metadata || stripeSub.metadata || {};
          const customerId = metadata.customerId ? parseInt(metadata.customerId) : null;

          if (customerId) {
            const plan = (metadata.plan as "MONTHLY" | "ANNUAL") || "ANNUAL";
            const pkgId = metadata.subscriptionPackageId ? parseInt(metadata.subscriptionPackageId) : null;
            const promoCode = metadata.promoCode || null;
            const price = metadata.finalPrice
              ? parseFloat(metadata.finalPrice)
              : (stripeSub.items.data[0]?.price.unit_amount || 0) / 100;

            const endDate = stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000)
              : new Date(Date.now() + (plan === "MONTHLY" ? 30 : 365) * 86400000);

            await syncCustomerSubscription({
              customerId,
              plan,
              subscriptionPackageId: pkgId,
              promoCode,
              price,
              currency: session.currency?.toUpperCase() || "EUR",
              paymentRef: subscriptionId,
              platform: "stripe",
              endDate,
              status: "ACTIVE",
            });

            console.log(`✅ Subscription activated for customer #${customerId} via Stripe Checkout`);
          }
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 2. Invoice Payment Succeeded (Recurring subscription renewal)
      // ─────────────────────────────────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string } | null;
        };
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subIdStr = typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;
          const stripeSub = (await stripe.subscriptions.retrieve(subIdStr)) as SubscriptionWithPeriod;
          const metadata = stripeSub.metadata || {};

          let customerId = metadata.customerId ? parseInt(metadata.customerId) : null;

          // If not in metadata, look up customer by paymentRef
          if (!customerId) {
            const existingSub = await prisma.subscription.findFirst({
              where: { paymentRef: subIdStr },
            });
            if (existingSub) {
              customerId = existingSub.customerId;
            }
          }

          if (customerId) {
            const endDate = stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000)
              : new Date();

            await prisma.subscription.updateMany({
              where: {
                OR: [{ customerId }, { paymentRef: subIdStr }],
              },
              data: {
                status: "ACTIVE",
                endDate,
                paymentRef: subIdStr,
                updatedAt: new Date(),
              },
            });

            console.log(`✅ Subscription renewed for customer #${customerId} until ${endDate.toISOString()}`);
          }
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 3. Customer Subscription Updated (Plan change, status update)
      // ─────────────────────────────────────────────────────────────────────────
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as SubscriptionWithPeriod;
        const subIdStr = stripeSub.id;
        const metadata = stripeSub.metadata || {};

        let customerId = metadata.customerId ? parseInt(metadata.customerId) : null;

        if (!customerId) {
          const existingSub = await prisma.subscription.findFirst({
            where: { paymentRef: subIdStr },
          });
          if (existingSub) {
            customerId = existingSub.customerId;
          }
        }

        if (customerId) {
          let status: "ACTIVE" | "EXPIRED" | "CANCELLED" = "ACTIVE";
          if (stripeSub.status === "canceled") {
            status = "CANCELLED";
          } else if (stripeSub.status === "past_due" || stripeSub.status === "unpaid") {
            status = "EXPIRED";
          }

          const endDate = stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : new Date();

          await prisma.subscription.updateMany({
            where: {
              OR: [{ customerId }, { paymentRef: subIdStr }],
            },
            data: {
              status,
              endDate,
              updatedAt: new Date(),
            },
          });

          console.log(`✅ Subscription status updated to ${status} for customer #${customerId}`);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 4. Customer Subscription Deleted (Cancellation / Expiration)
      // ─────────────────────────────────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const subIdStr = stripeSub.id;
        const metadata = stripeSub.metadata || {};

        let customerId = metadata.customerId ? parseInt(metadata.customerId) : null;

        if (!customerId) {
          const existingSub = await prisma.subscription.findFirst({
            where: { paymentRef: subIdStr },
          });
          if (existingSub) {
            customerId = existingSub.customerId;
          }
        }

        if (customerId) {
          await prisma.subscription.updateMany({
            where: {
              OR: [{ customerId }, { paymentRef: subIdStr }],
            },
            data: {
              status: "CANCELLED",
              updatedAt: new Date(),
            },
          });

          console.log(`🛑 Subscription marked CANCELLED for customer #${customerId}`);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
