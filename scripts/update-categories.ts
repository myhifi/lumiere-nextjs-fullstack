// ═══════════════════════════════════════════════════
// 🌐 Update existing categories with English names
// ═══════════════════════════════════════════════════
// This script is safe to run multiple times (idempotent).
// It updates existing categories in place, without
// touching any other data (reservations, reviews, etc.).

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map of slug → English name
const UPDATES = [
  { slug: "appetizers", nameEn: "Appetizers" },
  { slug: "main-courses", nameEn: "Main Courses" },
  { slug: "desserts", nameEn: "Desserts" },
  { slug: "beverages", nameEn: "Beverages" },
];

async function main() {
  console.log("\n🌐 Updating categories with English names...\n");

  for (const update of UPDATES) {
    const result = await prisma.category.update({
      where: { slug: update.slug },
      data: { nameEn: update.nameEn },
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