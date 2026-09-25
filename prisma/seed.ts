// نقطة الدخول لزرع البيانات التجريبية في قاعدة البيانات
// يُشغَّل عبر الأمر: npm run db:seed

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { categories } from './data/categories'
import { menuItems } from './data/menu-items'
import { tables } from './data/tables'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء زرع البيانات...')

  // ─── 1. تنظيف الجداول (الترتيب مهم بسبب العلاقات) ───
  await prisma.reservation.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  console.log('🧹 تم تنظيف الجداول')

  // ─── 2. زرع التصنيفات ───
  for (const category of categories) {
    await prisma.category.create({ data: category })
  }
  console.log(`📂 تم إنشاء ${categories.length} تصنيفات`)

  // ─── 3. زرع الأطباق (مع ربطها بتصنيفاتها) ───
  for (const item of menuItems) {
    const { categorySlug, ...itemData } = item

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })
    if (!category) {
      throw new Error(`❌ التصنيف "${categorySlug}" غير موجود`)
    }

    await prisma.menuItem.create({
      data: { ...itemData, categoryId: category.id },
    })
  }
  console.log(`🍽️  تم إنشاء ${menuItems.length} أطباق`)

  // ─── 4. زرع الطاولات ───
  for (const table of tables) {
    await prisma.table.create({ data: table })
  }
  console.log(`🪑 تم إنشاء ${tables.length} طاولات`)

  console.log('✨ اكتمل زرع البيانات بنجاح!')
}

main()
  .catch((error) => {
    console.error('❌ خطأ أثناء الزرع:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })