import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    CASUAL_DINING: "Casual Dining",
    PREMIUM_DINING: "Premium Dining",
    CAFES: "Cafés",
    BRUNCH: "Brunch",
    BARS_NIGHTLIFE: "Bars & Nightlife",
  };
  return labels[category] ?? category;
}

export function getCategorySlug(category: string) {
  return category.toLowerCase().replace(/_/g, "-");
}

export function getCategoryFromSlug(slug: string) {
  return slug.toUpperCase().replace(/-/g, "_");
}

export function getImageArray(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed.filter((img) => typeof img === "string" && img.length > 0) : [images];
  } catch {
    return [images];
  }
}
