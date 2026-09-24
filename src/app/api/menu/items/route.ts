// ═══════════════════════════════════════════════════
// 🍽️ GET /api/menu/items
// ═══════════════════════════════════════════════════
// يعيد قائمة الأطباق، مع دعم اختياري لـ:
//   ?category=slug     → تصفية حسب التصنيف
//   ?featured=true     → عرض الأطباق المميزة فقط
//   ?limit=N           → تحديد العدد

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const items = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(featured === 'true' && { isFeatured: true }),
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      take: limit ? parseInt(limit, 10) : undefined,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[GET /api/menu/items]', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحميل الأطباق' },
      { status: 500 }
    )
  }
}