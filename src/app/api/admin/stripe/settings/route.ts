import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, getAppUrl } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN"];

    if (!session || !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY || "";
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    const isConfigured = Boolean(secretKey);
    const isLiveMode = secretKey.startsWith("sk_live_");

    let balanceData: any = null;
    let connectionError: string | null = null;

    if (isConfigured) {
      try {
        const balance = await stripe.balance.retrieve();
        balanceData = {
          available: balance.available.map((b) => ({
            amount: b.amount / 100,
            currency: b.currency.toUpperCase(),
          })),
          pending: balance.pending.map((b) => ({
            amount: b.amount / 100,
            currency: b.currency.toUpperCase(),
          })),
        };
      } catch (err: any) {
        connectionError = err?.message || "Failed to connect to Stripe API";
      }
    }

    const maskKey = (key: string, keep = 4) => {
      if (!key) return "Not Configured";
      if (key.length <= keep * 2) return "••••••••";
      return `${key.slice(0, 8)}••••••••${key.slice(-keep)}`;
    };

    return NextResponse.json({
      isConfigured,
      isLiveMode,
      connectionStatus: isConfigured && !connectionError ? "CONNECTED" : "ERROR",
      connectionError,
      keys: {
        publishableKey: publishableKey ? maskKey(publishableKey, 6) : null,
        rawPublishableKey: publishableKey || null,
        secretKeyMasked: maskKey(secretKey, 4),
        webhookSecretMasked: maskKey(webhookSecret, 4),
      },
      webhookEndpoint: `${getAppUrl()}/api/stripe/webhook`,
      balance: balanceData,
      defaultCurrency: "EUR",
      monitoredEvents: [
        "checkout.session.completed",
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_succeeded",
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN"];

    if (!session || !STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "test_connection") {
      const startTime = Date.now();
      const balance = await stripe.balance.retrieve();
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        latencyMs,
        balance: {
          available: balance.available[0]?.amount / 100 || 0,
          currency: balance.available[0]?.currency?.toUpperCase() || "EUR",
        },
        livemode: balance.livemode,
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Connection test failed" },
      { status: 400 }
    );
  }
}
