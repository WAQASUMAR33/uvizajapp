import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ujivaj.com" },
    update: {},
    create: {
      email: "admin@ujivaj.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email);

  // Create primary user
  const primaryPassword = await bcrypt.hash("786ninja", 12);
  const primaryUser = await prisma.user.upsert({
    where: { email: "theitxprts@gmail.com" },
    update: { password: primaryPassword },
    create: {
      email: "theitxprts@gmail.com",
      password: primaryPassword,
      name: "The IT Xprts",
      role: "ADMIN",
    },
  });
  console.log("Primary user:", primaryUser.email);

  // Create test subscriber
  const subPassword = await bcrypt.hash("test123", 12);
  const subscriber = await prisma.user.upsert({
    where: { email: "test@ujivaj.com" },
    update: {},
    create: {
      email: "test@ujivaj.com",
      password: subPassword,
      name: "Test Subscriber",
      role: "PAID_SUBSCRIBER",
      subscription: {
        create: {
          plan: "ANNUAL",
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          price: 79.99,
          currency: "USD",
          platform: "web",
        },
      },
    },
  });
  console.log("Subscriber:", subscriber.email);

  // Merchants
  const merchants = [
    {
      name: "The Golden Fork",
      description: "Award-winning fine dining experience with seasonal menus crafted by Michelin-star chefs.",
      category: "PREMIUM_DINING" as const,
      city: "Dubai",
      address: "Downtown Dubai, Sheikh Mohammed Blvd",
      images: JSON.stringify(["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"]),
      savingsEstimate: 45.0,
      offers: [
        { title: "20% off your entire bill", discount: "20% OFF", description: "Valid Sunday to Thursday", terms: "Not valid on public holidays. Max 4 guests per table." },
        { title: "Complimentary dessert", discount: "FREE DESSERT", description: "Free dessert for two with any main course", terms: "One per table. Dine-in only." },
      ],
    },
    {
      name: "Brew & Bloom Café",
      description: "Artisan coffee roasters and brunch specialists. Cozy atmosphere, great music.",
      category: "CAFES" as const,
      city: "Dubai",
      address: "Jumeirah Beach Road, Al Wasl",
      images: JSON.stringify(["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"]),
      savingsEstimate: 15.0,
      offers: [
        { title: "Buy 1 Get 1 Coffee", discount: "BOGO", description: "Any specialty coffee drink", terms: "Valid on weekdays only. Excludes bottled drinks." },
        { title: "15% off brunch menu", discount: "15% OFF", description: "On all brunch items Saturday and Sunday", terms: "Brunch hours 9am-2pm only." },
      ],
    },
    {
      name: "Saffron & Spice",
      description: "Casual Indian dining with authentic recipes passed down three generations.",
      category: "CASUAL_DINING" as const,
      city: "Dubai",
      address: "Business Bay, Al Mustaqbal St",
      images: JSON.stringify(["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"]),
      savingsEstimate: 20.0,
      offers: [
        { title: "25% off lunch set menu", discount: "25% OFF", description: "Full 3-course lunch for AED 59", terms: "Weekdays 12pm-3pm only. Min 2 guests." },
      ],
    },
    {
      name: "Sunrise Brunch Co.",
      description: "The city's best weekend brunch destination. Live music, free-flowing beverages.",
      category: "BRUNCH" as const,
      city: "Abu Dhabi",
      address: "Corniche Road, Abu Dhabi",
      images: JSON.stringify(["https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800"]),
      savingsEstimate: 60.0,
      offers: [
        { title: "Soft brunch package upgrade", discount: "FREE UPGRADE", description: "Upgrade from non-alcoholic to soft package", terms: "Saturdays only. Advance booking required." },
        { title: "Third guest dines free", discount: "3RD GUEST FREE", description: "Every 3rd guest dines on us", terms: "Groups of 6 or more. Valid on Fridays." },
        { title: "10% off à la carte", discount: "10% OFF", description: "Entire à la carte menu", terms: "Not valid during brunch hours." },
      ],
    },
    {
      name: "Noir Lounge",
      description: "Sophisticated cocktail bar with live jazz every Friday. Dress code applies.",
      category: "BARS_NIGHTLIFE" as const,
      city: "Dubai",
      address: "DIFC, Gate Village",
      images: JSON.stringify(["https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"]),
      savingsEstimate: 35.0,
      offers: [
        { title: "2 cocktails for the price of 1", discount: "BOGO COCKTAILS", description: "On all signature cocktails 6pm-8pm", terms: "Monday to Thursday happy hours only." },
      ],
    },
    {
      name: "Ember Steakhouse",
      description: "Premium dry-aged steaks, oysters, and an extensive wine cellar.",
      category: "PREMIUM_DINING" as const,
      city: "Dubai",
      address: "Palm Jumeirah, Atlantis",
      images: JSON.stringify(["https://images.unsplash.com/photo-1544025162-d76694265947?w=800"]),
      savingsEstimate: 80.0,
      offers: [
        { title: "Complimentary bottle of wine", discount: "FREE WINE", description: "House wine with any 2 mains", terms: "Dinner service only, 7pm onwards. Reservation required." },
        { title: "30% off set dinner menu", discount: "30% OFF", description: "3-course prix-fixe dinner", terms: "Sunday and Monday only. Min 2 guests." },
      ],
    },
  ];

  for (const m of merchants) {
    const { offers, ...merchantData } = m;
    const existing = await prisma.merchant.findFirst({ where: { name: merchantData.name } });
    if (existing) {
      console.log("Skipping (exists):", merchantData.name);
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
    });
    console.log("Merchant:", merchant.name);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
