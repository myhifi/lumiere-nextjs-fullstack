// ═══════════════════════════════════════════════════
// 📂 GET /api/menu/categories
// ═══════════════════════════════════════════════════
// يعيد قائمة تصنيفات القائمة المرتبة حسب displayOrder

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('[GET /api/menu/categories]', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحميل التصنيفات' },
      { status: 500 }
    )
  }
}