import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateStripeCustomer, getAppUrl } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/stripe/portal
// Generates a Stripe Customer Portal link where subscribers can manage payment methods, view invoices, or cancel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let customerId = body?.customerId;

    if (!customerId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const c = await prisma.customer.findUnique({
          where: { email: session.user.email },
        });
        if (c) customerId = c.id;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const stripeCustomer = await getOrCreateStripeCustomer({
      customerId: customer.id,
      email: customer.email,
      name: customer.fullname,
    });

    const appUrl = getAppUrl();
    const returnUrl = body?.returnUrl || `${appUrl}/profile`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    console.error("Error creating Stripe portal session:", error);
    const message = error instanceof Error ? error.message : "Failed to create portal session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
