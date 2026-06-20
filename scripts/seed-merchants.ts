import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const merchants = [
  {
    nameEn: "Spice Route",
    nameHr: "Put Začina",
    descriptionEn: "A journey through Asian flavors — Thai, Vietnamese, and Malaysian dishes crafted with authentic ingredients.",
    descriptionHr: "Putovanje kroz azijske okuse — tajlandska, vijetnamska i malezijska jela spravljena s autentičnim sastojcima.",
    category: "CASUAL_DINING" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "JBR Walk, Jumeirah Beach Residence",
    addressHr: "JBR Walk, Jumeirah Beach Residence",
    images: JSON.stringify(["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"]),
    savingsEstimate: 25.0,
    offers: [
      { titleEn: "20% off total bill", titleHr: "20% popusta na ukupni račun", discountEn: "20% OFF", discountHr: "20% POPUSTA", descriptionEn: "On all dine-in orders", descriptionHr: "Na sve narudžbe u restoranu", termsEn: "Valid Sunday to Wednesday. Not combinable with other offers.", termsHr: "Vrijedi od nedjelje do srijede. Ne može se kombinirati s drugim ponudama." },
      { titleEn: "Free appetizer with 2 mains", titleHr: "Besplatno predjelo uz 2 glavna jela", discountEn: "FREE STARTER", discountHr: "BESPLATNO PREDJELO", descriptionEn: "Choose any starter from the menu", descriptionHr: "Odaberite bilo koje predjelo s jelovnika", termsEn: "Dine-in only. Min 2 main courses required.", termsHr: "Samo za konzumaciju u restoranu. Potrebna su najmanje 2 glavna jela." },
      { titleEn: "Kids eat free", titleHr: "Djeca jedu besplatno", discountEn: "KIDS FREE", discountHr: "DJECA BESPLATNO", descriptionEn: "One free kids meal per paying adult", descriptionHr: "Jedan besplatan dječji obrok po odrasloj osobi koja plaća", termsEn: "Valid on weekends. Children under 12 only.", termsHr: "Vrijedi vikendom. Samo za djecu mlađu od 12 godina." },
    ],
  },
  {
    nameEn: "The Rooftop Grill",
    nameHr: "Roštilj na krovu",
    descriptionEn: "Open-air rooftop dining with panoramic city views and a menu of premium grilled meats and seafood.",
    descriptionHr: "Večera na krovu na otvorenom s panoramskim pogledom na grad i jelovnikom vrhunskog roštilja i plodova mora.",
    category: "PREMIUM_DINING" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "Business Bay, Executive Tower",
    addressHr: "Business Bay, Executive Tower",
    images: JSON.stringify(["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"]),
    savingsEstimate: 55.0,
    offers: [
      { titleEn: "25% off à la carte menu", titleHr: "25% popusta na à la carte jelovnik", discountEn: "25% OFF", discountHr: "25% POPUSTA", descriptionEn: "Entire à la carte menu all day", descriptionHr: "Cijeli à la carte jelovnik cijeli dan", termsEn: "Not valid on public holidays or Friday nights.", termsHr: "Ne vrijedi na državne praznike ili petkom navečer." },
      { titleEn: "Complimentary sparkling water", titleHr: "Besplatna gazirana voda", discountEn: "FREE DRINKS", discountHr: "BESPLATNO PIĆE", descriptionEn: "Free sparkling water for the table", descriptionHr: "Besplatna gazirana voda za stol", termsEn: "Dine-in only. One bottle per table.", termsHr: "Samo za konzumaciju u restoranu. Jedna boca po stolu." },
      { titleEn: "Two mains for the price of one", titleHr: "Dva glavna jela po cijeni jednog", discountEn: "BOGO MAINS", discountHr: "2 ZA 1 GLAVNA JELA", descriptionEn: "On selected mains every Tuesday", descriptionHr: "Na odabrana glavna jela svakog utorka", termsEn: "Tuesdays only. Lower priced item is complimentary.", termsHr: "Samo utorkom. Jeftinije jelo je besplatno." },
    ],
  },
  {
    nameEn: "Matcha & More",
    nameHr: "Matcha i Više",
    descriptionEn: "Specialty matcha café serving Japanese-inspired drinks, pastries, and light bites in a zen atmosphere.",
    descriptionHr: "Specijalizirani matcha kafić koji poslužuje pića inspirirana Japanom, kolače i lagane zalogaje u zen atmosferi.",
    category: "CAFES" as const,
    cityEn: "Abu Dhabi",
    cityHr: "Abu Dhabi",
    addressEn: "Al Reem Island, Shams Boutik Mall",
    addressHr: "Al Reem Island, Shams Boutik Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"]),
    savingsEstimate: 12.0,
    offers: [
      { titleEn: "Buy 2 drinks get 1 free", titleHr: "Kupi 2 pića dobiješ 1 besplatno", discountEn: "BUY 2 GET 1", discountHr: "KUPI 2 DOBIJ 1", descriptionEn: "Any drinks on the menu", descriptionHr: "Bilo koje piće s jelovnika", termsEn: "Lowest priced drink is free. Valid all day.", termsHr: "Najjeftinije piće je besplatno. Vrijedi cijeli dan." },
      { titleEn: "10% off all pastries", titleHr: "10% popusta na sve kolače", discountEn: "10% OFF", discountHr: "10% POPUSTA", descriptionEn: "Entire pastry selection", descriptionHr: "Cijeli izbor kolača", termsEn: "Valid on weekdays only.", termsHr: "Vrijedi samo radnim danom." },
      { titleEn: "Free matcha shot upgrade", titleHr: "Besplatna nadogradnja matcha doze", discountEn: "FREE UPGRADE", discountHr: "BESPLATNA NADOGRADNJA", descriptionEn: "Upgrade any latte to matcha latte at no cost", descriptionHr: "Besplatno nadogradite bilo koji latte u matcha latte", termsEn: "One per customer per visit.", termsHr: "Jedan po kupcu po posjetu." },
    ],
  },
  {
    nameEn: "The Brunch Club",
    nameHr: "The Brunch Club",
    descriptionEn: "Dubai's most talked-about Friday brunch. International stations, live cooking, and free-flowing beverages.",
    descriptionHr: "Brunch o kojem se najviše priča petkom u Dubaiju. Međunarodne postaje, kuhanje uživo i neograničeno piće.",
    category: "BRUNCH" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "DIFC, ICD Brookfield Place",
    addressHr: "DIFC, ICD Brookfield Place",
    images: JSON.stringify(["https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800"]),
    savingsEstimate: 70.0,
    offers: [
      { titleEn: "30% off soft brunch package", titleHr: "30% popusta na bezalkoholni brunch paket", discountEn: "30% OFF", discountHr: "30% POPUSTA", descriptionEn: "Friday soft package brunch", descriptionHr: "Brunch s bezalkoholnim paketom petkom", termsEn: "Advance booking required. Fridays only.", termsHr: "Potrebna rezervacija unaprijed. Samo petkom." },
      { titleEn: "4th guest free", titleHr: "4. gost besplatno", discountEn: "4TH GUEST FREE", discountHr: "4. GOST GRATIS", descriptionEn: "Book a table of 4, pay for 3", descriptionHr: "Rezervirajte stol za 4, platite za 3", termsEn: "Groups of 4. One redemption per table per visit.", termsHr: "Grupe od 4. Jedno iskorištavanje po stolu po posjetu." },
      { titleEn: "Free mocktail on arrival", titleHr: "Besplatni koktel dobrodošlice", discountEn: "FREE MOCKTAIL", discountHr: "BESPLATAN MOCKTAIL", descriptionEn: "Welcome mocktail for each guest", descriptionHr: "Koktel dobrodošlice za svakog gosta", termsEn: "Valid for all brunch bookings. Any day.", termsHr: "Vrijedi za sve rezervacije bruncha. Bilo koji dan." },
    ],
  },
  {
    nameEn: "Velvet Lounge",
    nameHr: "Velvet Lounge",
    descriptionEn: "Upscale cocktail lounge featuring craft spirits, artisan cocktails, and live DJ sets every weekend.",
    descriptionHr: "Ekskluzivni koktel salon s domaćim žestokim pićima, vrhunskim koktelima i DJ setovima uživo svakog vikenda.",
    category: "BARS_NIGHTLIFE" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "Downtown Dubai, Souk Al Bahar",
    addressHr: "Downtown Dubai, Souk Al Bahar",
    images: JSON.stringify(["https://images.unsplash.com/photo-1485686531765-ba63b07845a7?w=800"]),
    savingsEstimate: 40.0,
    offers: [
      { titleEn: "Happy hour 2-for-1 cocktails", titleHr: "Happy hour 2 za 1 kokteli", discountEn: "2 FOR 1", discountHr: "2 ZA 1", descriptionEn: "All signature cocktails 5pm–7pm", descriptionHr: "Svi posebni kokteli od 17 do 19 sati", termsEn: "Sunday to Thursday only.", termsHr: "Samo od nedjelje do četvrtka." },
      { titleEn: "Free mocktail with any food order", titleHr: "Besplatan mocktail uz bilo koju narudžbu hrane", discountEn: "FREE MOCKTAIL", discountHr: "BESPLATAN MOCKTAIL", descriptionEn: "Complimentary mocktail with any food order", descriptionHr: "Besplatno piće uz svaku narudžbu hrane", termsEn: "Dine-in only. One per order.", termsHr: "Samo za konzumaciju u restoranu. Jedan po narudžbi." },
      { titleEn: "15% off bottle service", titleHr: "15% popusta na posluživanje boca", discountEn: "15% OFF", discountHr: "15% POPUSTA", descriptionEn: "On all bottle selections", descriptionHr: "Na sve odabire boca", termsEn: "Weekdays only. Advance reservation required.", termsHr: "Samo radnim danom. Potrebna rezervacija unaprijed." },
    ],
  },
  {
    nameEn: "Casa Italiana",
    nameHr: "Talijanska kuća",
    descriptionEn: "Authentic Italian trattoria with wood-fired pizzas, handmade pasta, and an award-winning wine list.",
    descriptionHr: "Autentična talijanska trattoria s pizzama iz krušne peći, ručno rađenom tjesteninom i nagrađivanom vinskom kartom.",
    category: "CASUAL_DINING" as const,
    cityEn: "Abu Dhabi",
    cityHr: "Abu Dhabi",
    addressEn: "Yas Island, Yas Mall",
    addressHr: "Yas Island, Yas Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"]),
    savingsEstimate: 30.0,
    offers: [
      { titleEn: "20% off pizza & pasta", titleHr: "20% popusta na pizze i tjestenine", discountEn: "20% OFF", discountHr: "20% POPUSTA", descriptionEn: "All wood-fired pizzas and handmade pasta", descriptionHr: "Sve pizze iz krušne peći i ručno rađena tjestenina", termsEn: "Lunch only, 12pm–4pm. Not on weekends.", termsHr: "Samo ručak, od 12 do 16 sati. Ne vikendom." },
      { titleEn: "Complimentary garlic bread", titleHr: "Besplatan kruh s češnjakom", discountEn: "FREE BREAD", discountHr: "BESPLATAN KRUH", descriptionEn: "Free garlic bread basket with any main", descriptionHr: "Besplatna košarica kruha s češnjakom uz glavno jelo", termsEn: "Dine-in only. One basket per table.", termsHr: "Samo za konzumaciju u restoranu. Jedna košarica po stolu." },
      { titleEn: "Family meal deal", titleHr: "Obiteljski meni ponuda", discountEn: "FAMILY DEAL", discountHr: "OBITELJSKA PONUDA", descriptionEn: "2 mains + 2 kids meals + 4 soft drinks", descriptionHr: "2 glavna jela + 2 dječja obroka + 4 bezalkoholna pića", termsEn: "Valid on weekends. Must mention offer on booking.", termsHr: "Vrijedi vikendom. Mora se navesti ponuda prilikom rezervacije." },
    ],
  },
  {
    nameEn: "The Sushi Bar",
    nameHr: "Sushi Bar",
    descriptionEn: "Premium Japanese sushi restaurant with omakase menus, fresh sashimi, and an extensive sake selection.",
    descriptionHr: "Vrhunski japanski sushi restoran s omakase jelovnicima, svježim sashimijem i bogatim izborom sakea.",
    category: "PREMIUM_DINING" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "Palm Jumeirah, Nakheel Mall",
    addressHr: "Palm Jumeirah, Nakheel Mall",
    images: JSON.stringify(["https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800"]),
    savingsEstimate: 65.0,
    offers: [
      { titleEn: "15% off omakase menu", titleHr: "15% popusta na omakase meni", discountEn: "15% OFF", discountHr: "15% POPUSTA", descriptionEn: "Full omakase tasting menu", descriptionHr: "Cijeli omakase degustacijski jelovnik", termsEn: "Dinner only. Reservation required 24hrs in advance.", termsHr: "Samo večera. Potrebna rezervacija 24 sata unaprijed." },
      { titleEn: "Free miso soup with any roll order", titleHr: "Besplatna miso juha uz svaku narudžbu rolica", discountEn: "FREE MISO", discountHr: "BESPLATAN MISO", descriptionEn: "Complimentary miso soup per person", descriptionHr: "Besplatna miso juha po osobi", termsEn: "Valid all day. Dine-in only.", termsHr: "Vrijedi cijeli dan. Samo za konzumaciju u restoranu." },
      { titleEn: "Sake pairing discount", titleHr: "Popust na sljubljivanje sakea", discountEn: "20% OFF SAKE", discountHr: "20% POPUSTA SAKE", descriptionEn: "20% off sake pairing with omakase", descriptionHr: "20% popusta na sljubljivanje sakea uz omakase", termsEn: "When ordered alongside omakase menu only.", termsHr: "Samo kada se naruči uz omakase jelovnik." },
    ],
  },
  {
    nameEn: "Bloom Café",
    nameHr: "Bloom Kafić",
    descriptionEn: "Bright and airy all-day café known for healthy bowls, cold brew coffee, and fresh-baked sourdough.",
    descriptionHr: "Svijetao i prozračan cjelodnevni kafić poznat po zdravim zdjelama, hladnoj kavi i svježe pečenom kiselom tijestu.",
    category: "CAFES" as const,
    cityEn: "Dubai",
    cityHr: "Dubai",
    addressEn: "Al Wasl Road, Jumeirah 1",
    addressHr: "Al Wasl Road, Jumeirah 1",
    images: JSON.stringify(["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"]),
    savingsEstimate: 14.0,
    offers: [
      { titleEn: "Free cold brew with any bowl", titleHr: "Besplatan cold brew uz svaku zdjelu", discountEn: "FREE DRINK", discountHr: "BESPLATNO PIĆE", descriptionEn: "Complimentary cold brew with any grain bowl", descriptionHr: "Besplatan cold brew uz bilo koju zdjelu sa žitaricama", termsEn: "Valid on weekdays only. One per customer.", termsHr: "Vrijedi samo radnim danom. Jedan po kupcu." },
      { titleEn: "10% off all-day breakfast", titleHr: "10% popusta na cjelodnevni doručak", discountEn: "10% OFF", discountHr: "10% POPUSTA", descriptionEn: "Full breakfast menu", descriptionHr: "Cijeli jelovnik za doručak", termsEn: "Before 11am only. Not valid on weekends.", termsHr: "Samo do 11 sati. Ne vrijedi vikendom." },
      { titleEn: "Loyalty stamp — 5th coffee free", titleHr: "Kartica vjernosti — 5. kava besplatno", discountEn: "LOYALTY OFFER", discountHr: "KARTICA VJERNOSTI", descriptionEn: "Buy 4 coffees and get your 5th free", descriptionHr: "Kupite 4 kave, 5. dobivate besplatno", termsEn: "Must present loyalty card. One stamp per visit.", termsHr: "Mora se predočiti kartica vjernosti. Jedan pečat po posjetu." },
    ],
  },
];

async function main() {
  console.log("Seeding merchants...\n");

  for (const m of merchants) {
    const { offers, ...merchantData } = m;

    const existing = await prisma.merchant.findFirst({ where: { nameEn: merchantData.nameEn } });
    if (existing) {
      console.log(`Skipping (exists): ${merchantData.nameEn}`);
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

    console.log(`Created: ${merchant.nameEn} (${merchant.offers.length} offers)`);
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
