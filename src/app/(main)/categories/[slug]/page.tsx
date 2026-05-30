import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { CATEGORIES } from "@/types";
import { getCategoryFromSlug } from "@/lib/utils";
import { Store } from "lucide-react";
import type { SafeMerchant } from "@/types";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryValue = getCategoryFromSlug(slug);
  const category = CATEGORIES.find((c) => c.value === categoryValue);
  if (!category) notFound();

  const merchants = await prisma.merchant.findMany({
    where: { isActive: true, category: categoryValue as any },
    include: { offers: { where: { isActive: true }, take: 3 } },
    orderBy: { createdAt: "desc" },
  }) as SafeMerchant[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-5xl">{category.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{category.label}</h1>
          <p className="text-slate-500 mt-1">{merchants.length} merchant{merchants.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {merchants.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No merchants in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
}
