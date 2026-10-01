import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateStripeCustomer, getAppUrl } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/stripe/checkout-session
// Creates a Stripe Checkout Session for recurring subscriptions (Web / Redirect flow)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerId, plan, subscriptionPackageId, promoCode, successUrl, cancelUrl } = body;
    let customerEmail = body?.customerEmail;

    // Optional: Check if next-auth user session exists if customerId is not passed
    if (!customerId && !customerEmail) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        customerEmail = session.user.email;
      }
    }

    if (!plan || !["MONTHLY", "ANNUAL"].includes(plan)) {
      return NextResponse.json({ error: "plan must be MONTHLY or ANNUAL" }, { status: 400 });
    }

    // Resolve Customer
    let customer = null;
    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) },
      });
    } else if (customerEmail) {
      customer = await prisma.customer.findUnique({
        where: { email: customerEmail.trim().toLowerCase() },
      });
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found. Please log in or provide valid customer credentials." },
        { status: 404 }
      );
    }

    // Resolve Price and Package info
    let price = plan === "MONTHLY" ? 9.99 : 79.99;
    let packageName = plan === "MONTHLY" ? "Monthly Subscription" : "Annual Subscription";
    let packageDescription = "Full access to exclusive dining perks and discounts.";

    if (subscriptionPackageId) {
      const pkg = await prisma.subscriptionPackage.findUnique({
        where: { id: parseInt(subscriptionPackageId) },
      });
      if (pkg) {
        price = plan === "MONTHLY" ? pkg.priceMonthly : pkg.priceYearly;
        packageName = pkg.titleEn || packageName;
        if (pkg.descriptionEn) {
          packageDescription = pkg.descriptionEn;
        }
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

    const finalPrice = Math.max(0.5, parseFloat((price - discountAmount).toFixed(2))); // Stripe requires minimum amount
    const unitAmountCents = Math.round(finalPrice * 100);

    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer({
      customerId: customer.id,
      email: customer.email,
      name: customer.fullname,
    });

    const appUrl = getAppUrl();
    const resolvedSuccessUrl =
      successUrl || `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl = cancelUrl || `${appUrl}/subscribe?canceled=true`;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: packageName,
              description: packageDescription,
            },
            unit_amount: unitAmountCents,
            recurring: {
              interval: plan === "MONTHLY" ? "month" : "year",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        customerId: customer.id.toString(),
        subscriptionPackageId: subscriptionPackageId ? subscriptionPackageId.toString() : "",
        plan,
        promoCode: appliedCode,
        finalPrice: finalPrice.toString(),
        discountAmount: discountAmount.toString(),
      },
      subscription_data: {
        metadata: {
          customerId: customer.id.toString(),
          subscriptionPackageId: subscriptionPackageId ? subscriptionPackageId.toString() : "",
          plan,
          promoCode: appliedCode,
          finalPrice: finalPrice.toString(),
        },
      },
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Error creating Stripe checkout session:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
