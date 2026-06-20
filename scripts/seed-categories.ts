import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    nameEn: "Casual Dining",
    nameHr: "Opušteno blagovanje",
    slug: "casual-dining",
    emoji: "🍽️",
    descriptionEn: "Relaxed everyday restaurants with great food at affordable prices.",
    descriptionHr: "Opušteni svakodnevni restorani s izvrsnom hranom po pristupačnim cijenama.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  },
  {
    nameEn: "Premium Dining",
    nameHr: "Vrhunsko blagovanje",
    slug: "premium-dining",
    emoji: "⭐",
    descriptionEn: "Fine dining experiences crafted by world-class chefs.",
    descriptionHr: "Fina jela i gastronomski užici koje kreiraju svjetski poznati kuhari.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  },
  {
    nameEn: "Cafés",
    nameHr: "Kafići",
    slug: "cafes",
    emoji: "☕",
    descriptionEn: "Specialty coffee shops, bakeries, and cozy all-day cafés.",
    descriptionHr: "Specijalizirane kavane, pekarnice i ugodni kafići za cjelodnevni boravak.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
  },
  {
    nameEn: "Brunch",
    nameHr: "Brunch",
    slug: "brunch",
    emoji: "🥂",
    descriptionEn: "The best weekend brunch spots with lavish spreads and live entertainment.",
    descriptionHr: "Najbolja mjesta za vikend brunch s bogatim izborom jela i zabavom uživo.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
  },
  {
    nameEn: "Bars & Nightlife",
    nameHr: "Barovi i Noćni život",
    slug: "bars-nightlife",
    emoji: "🍸",
    descriptionEn: "Cocktail bars, lounges, and nightlife venues with exclusive member offers.",
    descriptionHr: "Koktel barovi, salonski prostori i mjesta za noćni život s ekskluzivnim ponudama za članove.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
  },
];

async function main() {
  console.log("Seeding categories...\n");

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      await prisma.category.update({ where: { slug: cat.slug }, data: cat });
      console.log(`Updated: ${cat.emoji} ${cat.nameEn}`);
    } else {
      await prisma.category.create({ data: cat });
      console.log(`Created: ${cat.emoji} ${cat.nameEn}`);
    }
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
