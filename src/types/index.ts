export type UserRole = "GUEST" | "REGISTERED" | "PAID_SUBSCRIBER" | "ADMIN";
export type SubscriptionPlan = "MONTHLY" | "ANNUAL" | "FOUNDERS";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type MerchantCategory =
  | "CASUAL_DINING"
  | "PREMIUM_DINING"
  | "CAFES"
  | "BRUNCH"
  | "BARS_NIGHTLIFE";

export interface SafeUser {
  id: number;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  subscription?: SafeSubscription | null;
}

export interface SafeSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  price: number;
  currency: string;
}

export interface SafeMerchant {
  id: number;
  nameEn: string;
  nameHr: string;
  descriptionEn: string | null;
  descriptionHr: string | null;
  category: MerchantCategory;
  addressEn: string | null;
  addressHr: string | null;
  cityEn: string | null;
  cityHr: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  images: string | null;
  isActive: boolean;
  savingsEstimate: number;
  offers?: SafeOffer[];
}

export interface SafeOffer {
  id: number;
  merchantId: number;
  titleEn: string;
  titleHr: string;
  descriptionEn: string | null;
  descriptionHr: string | null;
  discountEn: string | null;
  discountHr: string | null;
  termsEn: string | null;
  termsHr: string | null;
  validFrom: Date;
  validUntil: Date | null;
  isActive: boolean;
}

export interface SafeRedemption {
  id: number;
  userId: number;
  offerId: number;
  merchantId: number;
  savings: number;
  redeemedAt: Date;
  offer?: SafeOffer;
  merchant?: Pick<SafeMerchant, "id" | "nameEn" | "nameHr" | "images">;
}

export const CATEGORIES: { value: MerchantCategory; label: string; slug: string; emoji: string }[] = [
  { value: "CASUAL_DINING", label: "Casual Dining", slug: "casual-dining", emoji: "🍽️" },
  { value: "PREMIUM_DINING", label: "Premium Dining", slug: "premium-dining", emoji: "⭐" },
  { value: "CAFES", label: "Cafés", slug: "cafes", emoji: "☕" },
  { value: "BRUNCH", label: "Brunch", slug: "brunch", emoji: "🥂" },
  { value: "BARS_NIGHTLIFE", label: "Bars & Nightlife", slug: "bars-nightlife", emoji: "🍸" },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "MONTHLY" as SubscriptionPlan,
    name: "Monthly",
    price: 9.99,
    period: "month",
    description: "Flexible month-to-month access",
    features: ["Full offer access", "Unlimited redemptions", "Priority support"],
  },
  {
    id: "ANNUAL" as SubscriptionPlan,
    name: "Annual",
    price: 79.99,
    period: "year",
    description: "Best value — save 33%",
    features: ["Full offer access", "Unlimited redemptions", "Priority support", "Early access to new merchants"],
    recommended: true,
  },
  {
    id: "FOUNDERS" as SubscriptionPlan,
    name: "Founders",
    price: 49.99,
    period: "year",
    description: "Limited early-bird pricing",
    features: ["Full offer access", "Unlimited redemptions", "Priority support", "Founders badge", "Lifetime rate lock"],
  },
];
