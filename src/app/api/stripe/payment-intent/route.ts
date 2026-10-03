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

    // Create PaymentIntent for the mobile PaymentSheet with off_session setup for recurring renewals
    const paymentIntent = await stripe.paymentIntents.create({
      amount: unitAmountCents,
      currency: "eur",
      customer: stripeCustomer.id,
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerId: customer.id.toString(),
        subscriptionPackageId: subscriptionPackageId ? subscriptionPackageId.toString() : "",
        plan,
        promoCode: appliedCode,
        finalPrice: finalPrice.toString(),
      },
    });

    return NextResponse.json({
      subscriptionId: paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
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
