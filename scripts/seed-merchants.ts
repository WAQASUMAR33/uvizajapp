import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const merchants = [
  {
    name: "Spice Route",
    description: "A journey through Asian flavors — Thai, Vietnamese, and Malaysian dishes crafted with authentic ingredients.",
    category: "CASUAL_DINING" as const,
    city: "Dubai",
    address: "JBR Walk, Jumeirah Beach Residence",
    images: JSON.stringify(["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"]),
    savingsEstimate: 25.0,
    offers: [
      { title: "20% off total bill", discount: "20% OFF", description: "On all dine-in orders", terms: "Valid Sunday to Wednesday. Not combinable with other offers." },
      { title: "Free appetizer with 2 mains", discount: "FREE STARTER", description: "Choose any starter from the menu", terms: "Dine-in only. Min 2 main courses required." },
      { title: "Kids eat free", discount: "KIDS FREE", description: "One free kids meal per paying adult", terms: "Valid on weekends. Children under 12 only." },
    ],
  },
  {
    name: "The Rooftop Grill",
    description: "Open-air rooftop dining with panoramic city views and a menu of premium grilled meats and seafood.",
    category: "PREMIUM_DINING" as const,
    city: "Dubai",
    address: "Business Bay, Executive Tower",
    images: JSON.stringify(["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"]),
    savingsEstimate: 55.0,
    offers: [
      { title: "25% off à la carte menu", discount: "25% OFF", description: "Entire à la carte menu all day", terms: "Not valid on public holidays or Friday nights." },
      { title: "Complimentary sparkling water", discount: "FREE DRINKS", description: "Free sparkling water for the table", terms: "Dine-in only. One bottle per table." },
      { title: "Two mains for the price of one", discount: "BOGO MAINS", description: "On selected mains every Tuesday", terms: "Tuesdays only. Lower priced item is complimentary." },
    ],
  },
  {
    name: "Matcha & More",
    description: "Specialty matcha café serving Japanese-inspired drinks, pastries, and light bites in a zen atmosphere.",
    category: "CAFES" as const,
    city: "Abu Dhabi",
    address: "Al Reem Island, Shams Boutik Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"]),
    savingsEstimate: 12.0,
    offers: [
      { title: "Buy 2 drinks get 1 free", discount: "BUY 2 GET 1", description: "Any drinks on the menu", terms: "Lowest priced drink is free. Valid all day." },
      { title: "10% off all pastries", discount: "10% OFF", description: "Entire pastry selection", terms: "Valid on weekdays only." },
      { title: "Free matcha shot upgrade", discount: "FREE UPGRADE", description: "Upgrade any latte to matcha latte at no cost", terms: "One per customer per visit." },
    ],
  },
  {
    name: "The Brunch Club",
    description: "Dubai's most talked-about Friday brunch. International stations, live cooking, and free-flowing beverages.",
    category: "BRUNCH" as const,
    city: "Dubai",
    address: "DIFC, ICD Brookfield Place",
    images: JSON.stringify(["https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800"]),
    savingsEstimate: 70.0,
    offers: [
      { title: "30% off soft brunch package", discount: "30% OFF", description: "Friday soft package brunch", terms: "Advance booking required. Fridays only." },
      { title: "4th guest free", discount: "4TH GUEST FREE", description: "Book a table of 4, pay for 3", terms: "Groups of 4. One redemption per table per visit." },
      { title: "Free mocktail on arrival", discount: "FREE MOCKTAIL", description: "Welcome mocktail for each guest", terms: "Valid for all brunch bookings. Any day." },
    ],
  },
  {
    name: "Velvet Lounge",
    description: "Upscale cocktail lounge featuring craft spirits, artisan cocktails, and live DJ sets every weekend.",
    category: "BARS_NIGHTLIFE" as const,
    city: "Dubai",
    address: "Downtown Dubai, Souk Al Bahar",
    images: JSON.stringify(["https://images.unsplash.com/photo-1485686531765-ba63b07845a7?w=800"]),
    savingsEstimate: 40.0,
    offers: [
      { title: "Happy hour 2-for-1 cocktails", discount: "2 FOR 1", description: "All signature cocktails 5pm–7pm", terms: "Sunday to Thursday only." },
      { title: "Free mocktail with any food order", discount: "FREE MOCKTAIL", description: "Complimentary mocktail with any food order", terms: "Dine-in only. One per order." },
      { title: "15% off bottle service", discount: "15% OFF", description: "On all bottle selections", terms: "Weekdays only. Advance reservation required." },
    ],
  },
  {
    name: "Casa Italiana",
    description: "Authentic Italian trattoria with wood-fired pizzas, handmade pasta, and an award-winning wine list.",
    category: "CASUAL_DINING" as const,
    city: "Abu Dhabi",
    address: "Yas Island, Yas Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"]),
    savingsEstimate: 30.0,
    offers: [
      { title: "20% off pizza & pasta", discount: "20% OFF", description: "All wood-fired pizzas and handmade pasta", terms: "Lunch only, 12pm–4pm. Not on weekends." },
      { title: "Complimentary garlic bread", discount: "FREE BREAD", description: "Free garlic bread basket with any main", terms: "Dine-in only. One basket per table." },
      { title: "Family meal deal", discount: "FAMILY DEAL", description: "2 mains + 2 kids meals + 4 soft drinks", terms: "Valid on weekends. Must mention offer on booking." },
    ],
  },
  {
    name: "The Sushi Bar",
    description: "Premium Japanese sushi restaurant with omakase menus, fresh sashimi, and an extensive sake selection.",
    category: "PREMIUM_DINING" as const,
    city: "Dubai",
    address: "Palm Jumeirah, Nakheel Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800"]),
    savingsEstimate: 65.0,
    offers: [
      { title: "15% off omakase menu", discount: "15% OFF", description: "Full omakase tasting menu", terms: "Dinner only. Reservation required 24hrs in advance." },
      { title: "Free miso soup with any roll order", discount: "FREE MISO", description: "Complimentary miso soup per person", terms: "Valid all day. Dine-in only." },
      { title: "Sake pairing discount", discount: "20% OFF SAKE", description: "20% off sake pairing with omakase", terms: "When ordered alongside omakase menu only." },
    ],
  },
  {
    name: "Bloom Café",
    description: "Bright and airy all-day café known for healthy bowls, cold brew coffee, and fresh-baked sourdough.",
    category: "CAFES" as const,
    city: "Dubai",
    address: "Al Wasl Road, Jumeirah 1",
    images: JSON.stringify(["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"]),
    savingsEstimate: 14.0,
    offers: [
      { title: "Free cold brew with any bowl", discount: "FREE DRINK", description: "Complimentary cold brew with any grain bowl", terms: "Valid on weekdays only. One per customer." },
      { title: "10% off all-day breakfast", discount: "10% OFF", description: "Full breakfast menu", terms: "Before 11am only. Not valid on weekends." },
      { title: "Loyalty stamp — 5th coffee free", discount: "LOYALTY OFFER", description: "Buy 4 coffees and get your 5th free", terms: "Must present loyalty card. One stamp per visit." },
    ],
  },
];

async function main() {
  console.log("Seeding merchants...\n");

  for (const m of merchants) {
    const { offers, ...merchantData } = m;

    const existing = await prisma.merchant.findFirst({ where: { name: merchantData.name } });
    if (existing) {
      console.log(`Skipping (exists): ${merchantData.name}`);
      continue;
    }

    const merchant = await prisma.merchant.create({
      data: {
        ...merchantData,
        offers: {
          create: offers.map((o) => ({
            ...o,
            isActive: true,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          })),
        },
      },
      include: { offers: true },
    });

    console.log(`Created: ${merchant.name} (${merchant.offers.length} offers)`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
