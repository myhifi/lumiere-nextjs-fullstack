// ═══════════════════════════════════════════════════
// 🌐 Backfill English names for existing menu items
// ═══════════════════════════════════════════════════
// Idempotent — safe to run multiple times.
// Does NOT wipe reservations or other data — updates in place.
// Run: npx tsx scripts/update-menu-items-en.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UPDATES = [
  {
    slug: "lentil-soup",
    nameEn: "Lentil Soup",
    descriptionEn: "Traditional lentil soup with cumin and lemon",
  },
  {
    slug: "hummus",
    nameEn: "Hummus with Tahini",
    descriptionEn: "Creamy hummus with olive oil and pine nuts",
  },
  {
    slug: "baba-ghanoush",
    nameEn: "Baba Ghanoush",
    descriptionEn: "Grilled eggplant with tahini and garlic",
  },
  {
    slug: "aleppo-kebab",
    nameEn: "Aleppo Kebab",
    descriptionEn: "Grilled meat kebab served with vermicelli rice",
  },
  {
    slug: "molokhia-chicken",
    nameEn: "Molokhia with Chicken",
    descriptionEn: "Green molokhia stew with grilled chicken and rice",
  },
  {
    slug: "moussaka",
    nameEn: "Moussaka",
    descriptionEn: "Layers of eggplant and minced meat in tomato sauce",
  },
  {
    slug: "knafeh",
    nameEn: "Cheese Knafeh",
    descriptionEn: "Golden knafeh stuffed with cheese and drizzled with syrup",
  },
  {
    slug: "om-ali",
    nameEn: "Om Ali",
    descriptionEn: "Traditional Egyptian dessert with milk and mixed nuts",
  },
  {
    slug: "basbousa",
    nameEn: "Basbousa with Cream",
    descriptionEn: "Tender basbousa stuffed with rich cream",
  },
  {
    slug: "lemon-mint",
    nameEn: "Lemon Mint Juice",
    descriptionEn: "Fresh lemon juice with iced mint",
  },
  {
    slug: "moroccan-tea",
    nameEn: "Moroccan Tea",
    descriptionEn: "Green tea with fresh mint served in a traditional glass",
  },
  {
    slug: "arabic-coffee",
    nameEn: "Arabic Coffee",
    descriptionEn: "Arabic coffee with cardamom and saffron",
  },
];

async function main() {
  console.log("\n🌐 Updating menu items with English names...\n");

  for (const update of UPDATES) {
    const result = await prisma.menuItem.update({
      where: { slug: update.slug },
      data: {
        nameEn: update.nameEn,
        descriptionEn: update.descriptionEn,
      },
    });
    console.log(`✅ ${result.name} → ${result.nameEn}`);
  }

  console.log("\n✨ Done!\n");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });