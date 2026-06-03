import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Casual Dining",
    slug: "casual-dining",
    emoji: "🍽️",
    description: "Relaxed everyday restaurants with great food at affordable prices.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    name: "Premium Dining",
    slug: "premium-dining",
    emoji: "⭐",
    description: "Fine dining experiences crafted by world-class chefs.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
  {
    name: "Cafés",
    slug: "cafes",
    emoji: "☕",
    description: "Specialty coffee shops, bakeries, and cozy all-day cafés.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    name: "Brunch",
    slug: "brunch",
    emoji: "🥂",
    description: "The best weekend brunch spots with lavish spreads and live entertainment.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
  },
  {
    name: "Bars & Nightlife",
    slug: "bars-nightlife",
    emoji: "🍸",
    description: "Cocktail bars, lounges, and nightlife venues with exclusive member offers.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
  },
];

async function main() {
  console.log("Seeding categories...\n");

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      await prisma.category.update({ where: { slug: cat.slug }, data: cat });
      console.log(`Updated: ${cat.emoji} ${cat.name}`);
    } else {
      await prisma.category.create({ data: cat });
      console.log(`Created: ${cat.emoji} ${cat.name}`);
    }
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
