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

  // Create test subscriber (Customer table)
  const subPassword = await bcrypt.hash("test123", 12);
  const subscriber = await prisma.customer.upsert({
    where: { email: "test@ujivaj.com" },
    update: {},
    create: {
      email: "test@ujivaj.com",
      password: subPassword,
      fullname: "Test Subscriber",
      subscription: {
        create: {
          plan: "ANNUAL",
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          price: 79.99,
          currency: "EUR",
          platform: "web",
        },
      },
    },
  });
  console.log("Subscriber:", subscriber.email);

  // Merchants
  const merchants = [
    {
      nameEn: "The Golden Fork",
      nameHr: "Zlatna Vilica",
      descriptionEn: "Award-winning fine dining experience with seasonal menus crafted by Michelin-star chefs.",
      descriptionHr: "Nagrađivani vrhunski gastronomski doživljaj sa sezonskim jelovnicima koje su osmislili kuhari s Michelinovim zvjezdicama.",
      category: "PREMIUM_DINING" as const,
      cityEn: "Dubai",
      cityHr: "Dubai",
      addressEn: "Downtown Dubai, Sheikh Mohammed Blvd",
      addressHr: "Downtown Dubai, Sheikh Mohammed Blvd",
      images: JSON.stringify(["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"]),
      savingsEstimate: 45.0,
      offers: [
        { titleEn: "20% off your entire bill", titleHr: "20% popusta na cijeli račun", discountEn: "20% OFF", discountHr: "20% POPUSTA", descriptionEn: "Valid Sunday to Thursday", descriptionHr: "Vrijedi od nedjelje do četvrtka", termsEn: "Not valid on public holidays. Max 4 guests per table.", termsHr: "Ne vrijedi na državne praznike. Najviše 4 gosta po stolu." },
        { titleEn: "Complimentary dessert", titleHr: "Besplatan desert", discountEn: "FREE DESSERT", discountHr: "BESPLATAN DESERT", descriptionEn: "Free dessert for two with any main course", descriptionHr: "Besplatan desert za dvoje uz bilo koje glavno jelo", termsEn: "One per table. Dine-in only.", termsHr: "Jedan po stolu. Samo za konzumaciju u restoranu." },
      ],
    },
    {
      nameEn: "Brew & Bloom Café",
      nameHr: "Brew & Bloom Kafić",
      descriptionEn: "Artisan coffee roasters and brunch specialists. Cozy atmosphere, great music.",
      descriptionHr: "Kafići s vrhunskom prženom kavom i stručnjaci za kasni doručak. Ugodna atmosfera, odlična glazba.",
      category: "CAFES" as const,
      cityEn: "Dubai",
      cityHr: "Dubai",
      addressEn: "Jumeirah Beach Road, Al Wasl",
      addressHr: "Jumeirah Beach Road, Al Wasl",
      images: JSON.stringify(["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"]),
      savingsEstimate: 15.0,
      offers: [
        { titleEn: "Buy 1 Get 1 Coffee", titleHr: "Kupi 1 dobiješ 1 kavu", discountEn: "BOGO", discountHr: "1+1 GRATIS", descriptionEn: "Any specialty coffee drink", descriptionHr: "Bilo koji specijalitet od kave", termsEn: "Valid on weekdays only. Excludes bottled drinks.", termsHr: "Vrijedi samo radnim danom. Ne uključuje flaširana pića." },
        { titleEn: "15% off brunch menu", titleHr: "15% popusta na meni za brunch", discountEn: "15% OFF", discountHr: "15% POPUSTA", descriptionEn: "On all brunch items Saturday and Sunday", descriptionHr: "Na sve stavke za brunch subotom i nedjeljom", termsEn: "Brunch hours 9am-2pm only.", termsHr: "Samo tijekom bruncha od 9 do 14 sati." },
      ],
    },
    {
      nameEn: "Saffron & Spice",
      nameHr: "Šafran i Začini",
      descriptionEn: "Casual Indian dining with authentic recipes passed down three generations.",
      descriptionHr: "Opušteni indijski restoran s autentičnim receptima koji se prenose kroz tri generacije.",
      category: "CASUAL_DINING" as const,
      cityEn: "Dubai",
      cityHr: "Dubai",
      addressEn: "Business Bay, Al Mustaqbal St",
      addressHr: "Business Bay, Al Mustaqbal St",
      images: JSON.stringify(["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800"]),
      savingsEstimate: 20.0,
      offers: [
        { titleEn: "25% off lunch set menu", titleHr: "25% popusta na ručak set meni", discountEn: "25% OFF", discountHr: "25% POPUSTA", descriptionEn: "Full 3-course lunch for AED 59", descriptionHr: "Cijeli ručak u 3 slijeda za 59 AED", termsEn: "Weekdays 12pm-3pm only. Min 2 guests.", termsHr: "Samo radnim danom od 12 do 15 sati. Min. 2 gosta." },
      ],
    },
    {
      nameEn: "Sunrise Brunch Co.",
      nameHr: "Sunrise Brunch Co.",
      descriptionEn: "The city's best weekend brunch destination. Live music, free-flowing beverages.",
      descriptionHr: "Najbolje gradsko odredište za vikend brunch. Glazba uživo, neograničeno piće.",
      category: "BRUNCH" as const,
      cityEn: "Abu Dhabi",
      cityHr: "Abu Dhabi",
      addressEn: "Corniche Road, Abu Dhabi",
      addressHr: "Corniche Road, Abu Dhabi",
      images: JSON.stringify(["https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800"]),
      savingsEstimate: 60.0,
      offers: [
        { titleEn: "Soft brunch package upgrade", titleHr: "Nadogradnja na bezalkoholni paket", discountEn: "FREE UPGRADE", discountHr: "BESPLATNA NADOGRADNJA", descriptionEn: "Upgrade from non-alcoholic to soft package", descriptionHr: "Nadogradnja s osnovnog na bezalkoholni paket", termsEn: "Saturdays only. Advance booking required.", termsHr: "Samo subotom. Potrebna rezervacija unaprijed." },
        { titleEn: "Third guest dines free", titleHr: "Treći gost jede besplatno", discountEn: "3RD GUEST FREE", discountHr: "3. GOST GRATIS", descriptionEn: "Every 3rd guest dines on us", descriptionHr: "Svaki treći gost jede na naš račun", termsEn: "Groups of 6 or more. Valid on Fridays.", termsHr: "Grupe od 6 ili više osoba. Vrijedi petkom." },
        { titleEn: "10% off à la carte", titleHr: "10% popusta na à la carte", discountEn: "10% OFF", discountHr: "10% POPUSTA", descriptionEn: "Entire à la carte menu", descriptionHr: "Cijeli à la carte jelovnik", termsEn: "Not valid during brunch hours.", termsHr: "Ne vrijedi tijekom bruncha." },
      ],
    },
    {
      nameEn: "Noir Lounge",
      nameHr: "Noir Lounge",
      descriptionEn: "Sophisticated cocktail bar with live jazz every Friday. Dress code applies.",
      descriptionHr: "Sofisticirani koktel bar s jazzom uživo svakog petka. Primjenjuje se pravilo odijevanja.",
      category: "BARS_NIGHTLIFE" as const,
      cityEn: "Dubai",
      cityHr: "Dubai",
      addressEn: "DIFC, Gate Village",
      addressHr: "DIFC, Gate Village",
      images: JSON.stringify(["https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800"]),
      savingsEstimate: 35.0,
      offers: [
        { titleEn: "2 cocktails for the price of 1", titleHr: "2 koktela po cijeni 1", discountEn: "BOGO COCKTAILS", discountHr: "2 ZA 1 KOKTELI", descriptionEn: "On all signature cocktails 6pm-8pm", descriptionHr: "Na sve koktele s potpisom od 18 do 20 sati", termsEn: "Monday to Thursday happy hours only.", termsHr: "Samo ponedjeljkom do četvrtka tijekom happy houra." },
      ],
    },
    {
      nameEn: "Ember Steakhouse",
      nameHr: "Ember Steakhouse",
      descriptionEn: "Premium dry-aged steaks, oysters, and an extensive wine cellar.",
      descriptionHr: "Vrhunski odležani odresci, kamenice i bogat vinski podrum.",
      category: "PREMIUM_DINING" as const,
      cityEn: "Dubai",
      cityHr: "Dubai",
      addressEn: "Palm Jumeirah, Atlantis",
      addressHr: "Palm Jumeirah, Atlantis",
      images: JSON.stringify(["https://images.unsplash.com/photo-1544025162-d76694265947?w=800"]),
      savingsEstimate: 80.0,
      offers: [
        { titleEn: "Complimentary bottle of wine", titleHr: "Besplatna boca vina", discountEn: "FREE WINE", discountHr: "BESPLATNO VINO", descriptionEn: "House wine with any 2 mains", descriptionHr: "Domaće vino uz bilo koja 2 glavna jela", termsEn: "Dinner service only, 7pm onwards. Reservation required.", termsHr: "Samo tijekom večere, od 19 sati. Potrebna rezervacija." },
        { titleEn: "30% off set dinner menu", titleHr: "30% popusta na fiksni meni", discountEn: "30% OFF", discountHr: "30% POPUSTA", descriptionEn: "3-course prix-fixe dinner", descriptionHr: "Večera u 3 slijeda po fiksnoj cijeni", termsEn: "Sunday and Monday only. Min 2 guests.", termsHr: "Samo nedjeljom i ponedjeljkom. Min. 2 gosta." },
      ],
    },
  ];

  for (const m of merchants) {
    const { offers, ...merchantData } = m;
    const existing = await prisma.merchant.findFirst({ where: { nameEn: merchantData.nameEn } });
    if (existing) {
      console.log("Skipping (exists):", merchantData.nameEn);
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
    console.log("Merchant:", merchant.nameEn);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
