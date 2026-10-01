import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey && process.env.NODE_ENV === "production") {
  console.warn("⚠️ STRIPE_SECRET_KEY is not defined in environment variables.");
}

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

/**
 * Finds an existing Stripe customer by email or metadata.customerId, or creates a new one.
 */
export async function getOrCreateStripeCustomer({
  customerId,
  email,
  name,
}: {
  customerId: number;
  email: string;
  name?: string | null;
}): Promise<Stripe.Customer> {
  // First search by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const existing = existingCustomers.data[0];
    // Update metadata if customerId is not yet assigned
    if (existing.metadata?.customerId !== customerId.toString()) {
      await stripe.customers.update(existing.id, {
        metadata: { ...existing.metadata, customerId: customerId.toString() },
      });
    }
    return existing;
  }

  // Create new customer
  const newCustomer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      customerId: customerId.toString(),
    },
  });

  return newCustomer;
}
