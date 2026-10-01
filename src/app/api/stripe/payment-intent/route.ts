import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

// POST /api/stripe/payment-intent
// Prepares Stripe Subscription & PaymentSheet credentials for native mobile apps (Flutter, React Native, iOS, Android)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerId, plan, subscriptionPackageId, promoCode } = body;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    if (!plan || !["MONTHLY", "ANNUAL"].includes(plan)) {
      return NextResponse.json({ error: "plan must be MONTHLY or ANNUAL" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Resolve Price and Package info
    let price = plan === "MONTHLY" ? 9.99 : 79.99;
    let packageName = plan === "MONTHLY" ? "Monthly Subscription" : "Annual Subscription";

    if (subscriptionPackageId) {
      const pkg = await prisma.subscriptionPackage.findUnique({
        where: { id: parseInt(subscriptionPackageId) },
      });
      if (pkg) {
        price = plan === "MONTHLY" ? pkg.priceMonthly : pkg.priceYearly;
        packageName = pkg.titleEn || packageName;
      }
    }

    // Apply Promo Code if valid
    let discountAmount = 0;
    let appliedCode = "";
    if (promoCode && typeof promoCode === "string") {
      const foundCode = await prisma.promoCode.findFirst({
        where: { code: promoCode.trim(), isActive: true },
      });
      if (foundCode) {
        const now = new Date();
        const isValidDate =
          (!foundCode.validFrom || foundCode.validFrom <= now) &&
          (!foundCode.validUntil || foundCode.validUntil >= now);
        const hasUsesLeft = foundCode.maxUses == null || foundCode.usedCount < foundCode.maxUses;

        if (isValidDate && hasUsesLeft) {
          appliedCode = foundCode.code;
          if (foundCode.discountType === "PERCENTAGE") {
            discountAmount = price * (foundCode.discountValue / 100);
            if (foundCode.maxDiscountAmount != null && discountAmount > foundCode.maxDiscountAmount) {
              discountAmount = foundCode.maxDiscountAmount;
            }
          } else {
            discountAmount = Math.min(price, foundCode.discountValue);
          }
        }
      }
    }

    const finalPrice = Math.max(0.5, parseFloat((price - discountAmount).toFixed(2)));
    const unitAmountCents = Math.round(finalPrice * 100);

    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer({
      customerId: customer.id,
      email: customer.email,
      name: customer.fullname,
    });

    // Create an ephemeral key for the mobile PaymentSheet
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomer.id },
      { apiVersion: "2025-02-24.acacia" }
    );

    // Create a Stripe recurring price dynamically
    const stripePrice = await stripe.prices.create({
      currency: "eur",
      unit_amount: unitAmountCents,
      recurring: {
        interval: plan === "MONTHLY" ? "month" : "year",
      },
      product_data: {
        name: packageName,
      },
    });

    // Create an incomplete subscription so the mobile app can collect payment details
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: stripePrice.id }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        customerId: customer.id.toString(),
        subscriptionPackageId: subscriptionPackageId ? subscriptionPackageId.toString() : "",
        plan,
        promoCode: appliedCode,
        finalPrice: finalPrice.toString(),
      },
    });

    const latestInvoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string } } | null;
    const clientSecret = latestInvoice?.payment_intent?.client_secret;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret || null,
      ephemeralKey: ephemeralKey.secret,
      customer: stripeCustomer.id,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      amount: finalPrice,
      currency: "EUR",
    });
  } catch (error: unknown) {
    console.error("Error creating Stripe payment intent for mobile:", error);
    const message = error instanceof Error ? error.message : "Failed to initialize mobile payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
