import { prisma } from "@/lib/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

interface SyncSubscriptionParams {
  customerId: number;
  plan: "MONTHLY" | "ANNUAL";
  subscriptionPackageId?: number | null;
  promoCode?: string | null;
  price: number;
  currency?: string;
  paymentRef: string; // Stripe Subscription ID or Checkout Session ID
  platform?: string;
  endDate: Date;
  status?: SubscriptionStatus;
}

export async function syncCustomerSubscription({
  customerId,
  plan,
  subscriptionPackageId,
  promoCode,
  price,
  currency = "EUR",
  paymentRef,
  platform = "stripe",
  endDate,
  status = "ACTIVE",
}: SyncSubscriptionParams) {
  // Check promo code if supplied
  let appliedPromoCodeId: number | null = null;
  let appliedPromoCodeStr: string | null = null;
  let discountAmount = 0;

  if (promoCode) {
    const foundCode = await prisma.promoCode.findFirst({
      where: { code: promoCode.trim(), isActive: true },
    });
    if (foundCode) {
      appliedPromoCodeId = foundCode.id;
      appliedPromoCodeStr = foundCode.code;
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

  const writeData = {
    plan: plan as SubscriptionPlan,
    status,
    endDate,
    price,
    currency,
    paymentRef,
    platform,
    subscriptionPackageId: subscriptionPackageId ?? null,
    promoCodeId: appliedPromoCodeId,
    promoCode: appliedPromoCodeStr,
    discountAmount,
  };

  return await prisma.subscription.upsert({
    where: { customerId },
    update: writeData,
    create: {
      customerId,
      ...writeData,
    },
    include: {
      subscriptionPackage: true,
      promoCodeRecord: true,
    },
  });
}
